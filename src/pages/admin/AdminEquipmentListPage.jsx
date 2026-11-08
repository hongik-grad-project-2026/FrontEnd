import { useId, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ALL_CATEGORY_OPTION,
  categoryKeys,
  fetchCategories,
  toCategoryOption,
} from "../../api/categories";
import { isMockMode } from "../../api/client";
import {
  createAdminEquipmentModel,
  disposeAdminEquipmentModel,
  equipmentKeys,
  getAdminEquipmentModels,
  updateAdminEquipmentModel,
} from "../../api/equipmentApi";
import { saveSemester } from "../../api/semesterApi";
import { MODEL_STATUS, getModelStatus } from "../../constants/status";

import Button from "../../components/common/Button";
import IconButton from "../../components/common/IconButton";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/layout/PageHeader";
import ConfirmModal from "../../components/modal/ConfirmModal";
import EquipmentCreateModal from "../../components/modal/EquipmentCreateModal";
import EquipmentSettingModal from "../../components/modal/EquipmentSettingModal";
import EquipmentDisposeModal from "../../components/modal/EquipmentDisposeModal";
import EquipmentItemEditModal from "../../components/modal/EquipmentItemEditModal";
import DataTable from "../../components/table/DataTable";
import styles from "./AdminEquipmentListPage.module.css";

const ROWS_PER_PAGE = 10;

const RENTAL_POLICY_LABELS = {
  regular: "사전",
  always: "상시",
};

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}

function formatDisplayDate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function EquipmentImageCell() {
  return (
    <span className={styles.imageCell} aria-hidden="true">
      <span className={styles.imagePlaceholder}>
        <span className={styles.photoIcon} />
      </span>
    </span>
  );
}

function EquipmentNameCell({ equipment }) {
  const rentalPolicyText = equipment.rentalPolicies
    ? RENTAL_POLICY_LABELS[equipment.rentalPolicies] ?? equipment.rentalPolicies
    : "";

  return (
    <span className={styles.cellStack}>
      <strong className={styles.equipmentName} title={equipment.name}>
        {equipment.name}
      </strong>
      {equipment.rentalPolicies ? (
        <span className={styles.secondaryText} title={rentalPolicyText}>
          {rentalPolicyText}
        </span>
      ) : null}
    </span>
  );
}

function CategoryCell({ categoryLabel, equipment }) {
  return (
    <span className={styles.cellStack}>
      <span className={styles.singleLineText}>{categoryLabel}</span>
      {equipment.os ? (
        <span className={styles.secondaryText} title={equipment.os}>
          {equipment.os}
        </span>
      ) : null}
    </span>
  );
}

function MultilineCell({ text }) {
  return (
    <span className={styles.multilineText} title={text || undefined}>
      {text}
    </span>
  );
}

function EquipmentDateCell({ equipment }) {
  return (
    <span className={styles.cellStack}>
      <time
        className={styles.dateText}
        dateTime={equipment.receivedDate.replaceAll(".", "-")}
        aria-label={`입고일 ${equipment.receivedDate}`}
      >
        {equipment.receivedDate}
      </time>
      <time
        className={styles.dateText}
        dateTime={equipment.disposalDate.replaceAll(".", "-")}
        aria-label={`폐기일 ${equipment.disposalDate}`}
      >
        {equipment.disposalDate}
      </time>
    </span>
  );
}

function EquipmentActionsCell({
  disabled,
  equipment,
  onDispose,
  onEdit,
}) {
  const handleEdit = (event) => {
    event.stopPropagation();
    onEdit(equipment, event);
  };

  const handleDispose = (event) => {
    event.stopPropagation();
    onDispose(equipment, event);
  };

  return (
    <span className={styles.actionButtons}>
      <IconButton
        className={styles.actionButton}
        icon="edit"
        size={24}
        type="button"
        ariaLabel={`${equipment.name} 수정`}
        disabled={disabled}
        onClick={handleEdit}
      />
      <IconButton
        className={styles.actionButton}
        icon="trash"
        size={24}
        type="button"
        ariaLabel={`${equipment.name} 폐기`}
        disabled={disabled}
        onClick={handleDispose}
      />
    </span>
  );
}

function AdminEquipmentListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const panelId = useId();
  const registerButtonRef = useRef(null);
  const settingButtonRef = useRef(null);
  const editButtonRef = useRef(null);
  const disposeButtonRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(
    ALL_CATEGORY_OPTION.value,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [editTargetEquipment, setEditTargetEquipment] = useState(null);
  const [disposeTargetEquipment, setDisposeTargetEquipment] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const categoryQuery = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: ({ signal }) => fetchCategories({ signal }),
  });
  const categoryOptions = (categoryQuery.data ?? []).map((category) =>
    toCategoryOption(category, { useMockKey: isMockMode }),
  );
  const hasCategories = categoryQuery.isSuccess && categoryOptions.length > 0;
  const selectedCategoryOption = categoryOptions.find(
    (category) => category.value === selectedCategory,
  );
  const selectedCategoryId = selectedCategoryOption?.categoryId ?? null;
  const normalizedSearchTerm = searchTerm.trim();
  const listParams = {
    categoryId: selectedCategoryId,
    keyword: normalizedSearchTerm,
    page: currentPage - 1,
    size: ROWS_PER_PAGE,
  };

  const equipmentQuery = useQuery({
    queryKey: equipmentKeys.adminModelList(listParams),
    queryFn: ({ signal }) =>
      getAdminEquipmentModels({ ...listParams, signal }),
    enabled: isMockMode && hasCategories,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const invalidateEquipmentQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: equipmentKeys.adminModelLists(),
    });
  };

  const settingMutation = useMutation({
    mutationFn: saveSemester,
    onSuccess: (_result, values) => {
      queryClient.setQueryData(["semester", "current"], {
        ...values,
      });
      setIsSettingModalOpen(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: createAdminEquipmentModel,
    onSuccess: async () => {
      await invalidateEquipmentQueries();
      setIsCreateModalOpen(false);
      setFeedback({ type: "create-success" });
    },
    onError: (error) => {
      setFeedback({
        type: "operation-error",
        message: getErrorMessage(error, "기자재를 등록하지 못했습니다."),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminEquipmentModel,
    onSuccess: async () => {
      await invalidateEquipmentQueries();
      setEditTargetEquipment(null);
      setFeedback({ type: "edit-success" });
    },
    onError: (error) => {
      setFeedback({
        type: "operation-error",
        message: getErrorMessage(error, "기자재를 수정하지 못했습니다."),
      });
    },
  });

  const disposeMutation = useMutation({
    mutationFn: disposeAdminEquipmentModel,
    onSuccess: async () => {
      await invalidateEquipmentQueries();
      setDisposeTargetEquipment(null);
      setFeedback({ type: "dispose-success" });
    },
    onError: (error) => {
      setFeedback({
        type:
          error?.code === "MODEL_HAS_UNAVAILABLE_ITEMS"
            ? "dispose-failure"
            : "operation-error",
        message: getErrorMessage(error, "기자재를 폐기하지 못했습니다."),
      });
    },
  });

  const isMutationPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    disposeMutation.isPending;
  const categoryLabels = Object.fromEntries(
    categoryOptions.map((category) => [
      String(category.categoryId),
      category.label,
    ]),
  );
  const categoryCounts = equipmentQuery.data?.categoryCounts ?? {};
  const tabItems = [
    {
      ...ALL_CATEGORY_OPTION,
      count: isMockMode ? categoryCounts.all : undefined,
      controlsId: panelId,
      disabled: !hasCategories,
    },
    ...categoryOptions.map((category) => ({
      ...category,
      count: isMockMode
        ? categoryCounts[String(category.categoryId)] ?? 0
        : undefined,
      controlsId: panelId,
    })),
  ];
  const selectedCategoryLabel =
    selectedCategory === ALL_CATEGORY_OPTION.value
      ? ALL_CATEGORY_OPTION.label
      : selectedCategoryOption?.label ?? "카테고리";
  const visibleEquipment = equipmentQuery.data?.content ?? [];
  const totalPages = Math.max(1, equipmentQuery.data?.totalPages ?? 0);
  const resolvedCurrentPage = equipmentQuery.data
    ? equipmentQuery.data.page + 1
    : currentPage;

  const handleCategoryChange = (nextCategory) => {
    setSelectedCategory(nextCategory);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (inputText) => {
    setSearchTerm(inputText);
    setCurrentPage(1);
  };

  const handleOpenAssetList = (equipment) => {
    navigate(
      `/admin/equipment/${encodeURIComponent(equipment.modelId)}/assets`,
    );
  };

  const handleCloseSettingModal = () => {
    if (!settingMutation.isPending) {
      setIsSettingModalOpen(false);
    }
  };

  const handleCloseCreateModal = () => {
    if (!createMutation.isPending) {
      setIsCreateModalOpen(false);
    }
  };

  const resolveCategory = (categoryKey) => {
    const category = categoryOptions.find(
      (option) => option.value === categoryKey,
    );

    if (!category) {
      throw new Error("선택한 카테고리를 확인할 수 없습니다.");
    }

    return category;
  };

  const toMutationValues = (values) => {
    const category = resolveCategory(values.categoryKey ?? values.category);

    return {
      ...values,
      modelId: values.modelId,
      categoryId: category.categoryId,
      categoryKey: category.key,
      receivedDate: formatDisplayDate(values.receivedDate),
      disposalDate: formatDisplayDate(values.disposalDate),
    };
  };

  const handleEquipmentSettings = (values) => {
    console.log('===handleEquipmentSettings===', values);
    settingMutation.mutate(values);
  }

  const handleCreateEquipment = (values) =>
    createMutation.mutateAsync(toMutationValues(values));

  const handleOpenEditModal = (equipment, event) => {
    if (isMutationPending) return;
    editButtonRef.current = event.currentTarget;
    setEditTargetEquipment(equipment);
  };

  const handleCloseEditModal = () => {
    if (!updateMutation.isPending) {
      setEditTargetEquipment(null);
    }
  };

  const handleUpdateEquipment = (values) =>
    updateMutation.mutateAsync(toMutationValues(values));

  const handleOpenDisposeModal = (equipment, event) => {
    if (isMutationPending) return;
    disposeButtonRef.current = event.currentTarget;
    setDisposeTargetEquipment(equipment);
  };

  const handleCloseDisposeModal = () => {
    if (!disposeMutation.isPending) {
      setDisposeTargetEquipment(null);
    }
  };

  const handleDisposeEquipment = (equipment) => {
    disposeMutation.mutate({ modelId: equipment.modelId });
  };

  let emptyMessage = normalizedSearchTerm
    ? "검색 조건에 해당하는 기자재가 없습니다."
    : selectedCategory === ALL_CATEGORY_OPTION.value
      ? "표시할 기자재가 없습니다."
      : "해당 카테고리에 표시할 기자재가 없습니다.";

  if (!isMockMode) {
    emptyMessage = "기자재 API가 아직 제공되지 않았습니다.";
  } else if (equipmentQuery.isPending) {
    emptyMessage = "기자재 목록을 불러오는 중입니다.";
  } else if (equipmentQuery.isError) {
    emptyMessage = "기자재 목록을 불러오지 못했습니다.";
  }

  const columns = [
    {
      key: "image",
      header: <span className={styles.visuallyHidden}>이미지</span>,
      width: 84,
      render: () => <EquipmentImageCell />,
    },
    {
      key: "name",
      header: "모델명 / 대여정책",
      width: 222,
      render: (equipment) => <EquipmentNameCell equipment={equipment} />,
    },
    {
      key: "category",
      header: "카테고리",
      width: 102,
      render: (equipment) => (
        <CategoryCell
          equipment={equipment}
          categoryLabel={categoryLabels[String(equipment.categoryId)] ?? "카테고리"}
        />
      ),
    },
    {
      key: "accessories",
      header: "구성품",
      width: 136,
      render: (equipment) => <MultilineCell text={equipment.accessories} />,
    },
    {
      key: "specification",
      header: "성능",
      width: 136,
      render: (equipment) => <MultilineCell text={equipment.specification} />,
    },
    {
      key: "description",
      header: "설명",
      width: 136,
      render: (equipment) => <MultilineCell text={equipment.description} />,
    },
    {
      key: "stockText",
      header: "재고",
      width: 60,
      render: (equipment) => (
        <span className={styles.stockText}>{equipment.stockText}</span>
      ),
    },
    {
      key: "status",
      header: "상태",
      width: 92,
      render: (equipment) => {
        const status = getModelStatus(equipment.status);
        return (
          <StatusBadge text={status.label} color={status.color} size="lg" border />
        );
      },
    },
    {
      key: "dates",
      header: "입고 / 폐기일",
      width: 84,
      render: (equipment) => <EquipmentDateCell equipment={equipment} />,
    },
    {
      key: "actions",
      header: "수정/폐기",
      width: 68,
      render: (equipment) => (
        <EquipmentActionsCell
          disabled={isMutationPending}
          equipment={equipment}
          onEdit={handleOpenEditModal}
          onDispose={handleOpenDisposeModal}
        />
      ),
    },
  ];

  return (
    <section className={styles.page}>
      <PageHeader />
      <div className={styles.contentViewport} role="region" aria-label="모델 목록 영역">
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <Tabs
              className={styles.categoryTabs}
              items={tabItems}
              value={selectedCategory}
              onChange={handleCategoryChange}
              ariaLabel="모델 카테고리"
            />
            <SearchBar
              className={styles.search}
              name="equipmentSearch"
              width={360}
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              ariaLabel="모델명 검색"
              placeholder="모델명으로 검색..."
              disabled={!isMockMode || !hasCategories}
            />
          </div>

          {categoryQuery.isPending ? (
            <p className={styles.categoryState}>카테고리를 불러오는 중입니다.</p>
          ) : null}
          {categoryQuery.isError ? (
            <div className={styles.categoryState} role="alert">
              <p>{categoryQuery.error?.message || "카테고리를 불러오지 못했습니다."}</p>
              <Button
                color="Neutral"
                kind="border"
                size="Default"
                status="Default"
                text="다시 시도"
                disabled={categoryQuery.isFetching}
                onClick={() => categoryQuery.refetch()}
              />
            </div>
          ) : null}
          {categoryQuery.isSuccess && !hasCategories ? (
            <p className={styles.categoryState}>등록된 카테고리가 없습니다.</p>
          ) : null}

          {hasCategories ? (
            <>
              <div
                id={panelId}
                className={styles.tablePanel}
                role="tabpanel"
                aria-label={`${selectedCategoryLabel} 모델 목록`}
                aria-busy={equipmentQuery.isFetching}
              >
                <DataTable
                  className={styles.dataTable}
                  ariaLabel="관리자 기자재 모델 목록"
                  columns={columns}
                  rows={visibleEquipment}
                  getRowId={(equipment) => equipment.modelId}
                  onRowClick={handleOpenAssetList}
                  minWidth={1120}
                  emptyMessage={emptyMessage}
                />
              </div>
              <div className={styles.footer}>
                <Pagination
                  className={styles.pagination}
                  page={resolvedCurrentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                  ariaLabel="기자재 목록 페이지 이동"
                />
                <div className={styles.btnsWrapper}>
                  <Button
                    ref={settingButtonRef}
                    className={styles.manageButton}
                    kind="border"
                    size="Default"
                    color="Primary"
                    status="Default"
                    type="button"
                    text="학기 통합 관리"
                    // disabled={!isMockMode || isMutationPending}
                    onClick={() => setIsSettingModalOpen(true)}
                  />
                  <Button
                    ref={registerButtonRef}
                    className={styles.registerButton}
                    kind="border"
                    size="Default"
                    color="Primary"
                    status="Default"
                    type="button"
                    text="모델 등록"
                    disabled={!isMockMode || isMutationPending}
                    onClick={() => setIsCreateModalOpen(true)}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {isSettingModalOpen ? (
        <EquipmentSettingModal
          isOpen
          isPending={settingMutation.isPending}
          onClose={handleCloseSettingModal}
          onConfirm={handleEquipmentSettings}
          returnFocusRef={settingButtonRef}
        />
      ) : null}

      <EquipmentCreateModal
        isOpen={isCreateModalOpen}
        isPending={createMutation.isPending}
        categoryOptions={categoryOptions}
        onClose={handleCloseCreateModal}
        onConfirm={handleCreateEquipment}
        returnFocusRef={registerButtonRef}
      />
      {editTargetEquipment ? (
        <EquipmentItemEditModal
          key={editTargetEquipment.modelId}
          isOpen
          isPending={updateMutation.isPending}
          equipment={editTargetEquipment}
          categoryOptions={categoryOptions}
          onClose={handleCloseEditModal}
          onConfirm={handleUpdateEquipment}
          returnFocusRef={editButtonRef}
        />
      ) : null}
      {disposeTargetEquipment ? (
        <EquipmentDisposeModal
          isOpen
          isPending={disposeMutation.isPending}
          equipment={disposeTargetEquipment}
          categoryLabel={
            categoryLabels[String(disposeTargetEquipment.categoryId)] ?? "-"
          }
          onClose={handleCloseDisposeModal}
          onConfirm={handleDisposeEquipment}
          returnFocusRef={disposeButtonRef}
        />
      ) : null}

      <ConfirmModal
        isOpen={feedback?.type === "create-success"}
        icon="checkmark"
        title="등록 완료"
        description="정상적으로 등록되었습니다."
        secondaryDescription="기자재 모델 상세페이지에서 기기를 등록해주세요."
        confirmText="확인"
        showCancel={false}
        onClose={() => setFeedback(null)}
        onConfirm={() => setFeedback(null)}
        returnFocusRef={registerButtonRef}
      />
      <ConfirmModal
        isOpen={feedback?.type === "edit-success"}
        icon="checkmark"
        title="수정 완료"
        description="정상적으로 수정되었습니다."
        confirmText="확인"
        showCancel={false}
        onClose={() => setFeedback(null)}
        onConfirm={() => setFeedback(null)}
        returnFocusRef={editButtonRef}
      />
      <ConfirmModal
        isOpen={feedback?.type === "dispose-success"}
        icon="checkmark"
        title="폐기 완료"
        description="정상적으로 폐기처리되었습니다."
        confirmText="확인"
        showCancel={false}
        onClose={() => setFeedback(null)}
        onConfirm={() => setFeedback(null)}
        returnFocusRef={disposeButtonRef}
      />
      <ConfirmModal
        isOpen={feedback?.type === "dispose-failure"}
        icon="warning"
        title="폐기 불가능 상태입니다"
        description={feedback?.message || "아직 대여중인 기기가 존재합니다."}
        confirmText="확인"
        confirmColor="Danger"
        showCancel={false}
        onClose={() => setFeedback(null)}
        onConfirm={() => setFeedback(null)}
      />
      <ConfirmModal
        isOpen={feedback?.type === "operation-error"}
        icon="warning"
        title="요청을 처리하지 못했습니다"
        description={feedback?.message}
        confirmText="확인"
        confirmColor="Danger"
        showCancel={false}
        onClose={() => setFeedback(null)}
        onConfirm={() => setFeedback(null)}
      />
    </section>
  );
}

export default AdminEquipmentListPage;
