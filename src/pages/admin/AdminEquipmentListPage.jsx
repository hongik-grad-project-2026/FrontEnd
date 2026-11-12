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
  getAdminEquipmentModelByID,
  getAdminEquipmentModels,
  uploadAdminEquipmentModelImage,
  updateAdminEquipmentModel,
} from "../../api/equipmentApi";
import { saveSemester } from "../../api/semesterApi";
import { MODEL_STATUS, getModelStatus } from "../../constants/status";
import { useUser } from "../../context/UserContext";

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

function getCreateModelErrorMessage(error) {
  if (error?.code === "LABELPREFIX404_1") {
    return "등록할 수 없는 라벨 번호입니다.";
  }

  return getErrorMessage(error, "기자재를 등록하지 못했습니다.");
}

function getUpdateModelErrorMessage(error) {
  return error?.code === "LABELPREFIX404_1"
    ? "등록할 수 없는 라벨 번호입니다."
    : getErrorMessage(error, "기자재를 수정하지 못했습니다.");
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

function EquipmentImageCell({ equipment }) {
  const [failedImageUrl, setFailedImageUrl] = useState(null);
  const imageUrl = equipment.modelImageUrl;
  const canShowImage = imageUrl && failedImageUrl !== imageUrl;

  return (
    <span className={styles.imageCell}>
      <span className={styles.imagePlaceholder}>
        {canShowImage ? (
          <img
            className={styles.modelImage}
            src={imageUrl}
            alt={`${equipment.name} 이미지`}
            onError={() => setFailedImageUrl(imageUrl)}
          />
        ) : (
          <span className={styles.photoIcon} aria-hidden="true" />
        )}
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
  const receivedDateTime =
    equipment.receivedDate === "-"
      ? undefined
      : equipment.receivedDate.replaceAll(".", "-");
  const disposalDateTime =
    equipment.disposalDate === "-"
      ? undefined
      : equipment.disposalDate.replaceAll(".", "-");

  return (
    <span className={styles.cellStack}>
      <time
        className={styles.dateText}
        dateTime={receivedDateTime}
        aria-label={`입고일 ${equipment.receivedDate}`}
      >
        {equipment.receivedDate}
      </time>
      <time
        className={styles.dateText}
        dateTime={disposalDateTime}
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
  const { user } = useUser();
  const canManageModels = isMockMode || user?.serverRole === "ASSISTANT";
  const panelId = useId();
  const registerButtonRef = useRef(null);
  const settingButtonRef = useRef(null);
  const createSubmissionGuardRef = useRef(false);
  const pendingImageUploadModelIdRef = useRef(null);
  const pendingEditImageModelIdRef = useRef(null);
  const updateSubmissionGuardRef = useRef(false);
  const disposeSubmissionGuardRef = useRef(false);
  const editButtonRef = useRef(null);
  const disposeButtonRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(
    ALL_CATEGORY_OPTION.value,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [pendingImageUploadModelId, setPendingImageUploadModelId] =
    useState(null);
  const [pendingEditImageModelId, setPendingEditImageModelId] = useState(null);
  const [loadingEditModelId, setLoadingEditModelId] = useState(null);
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
    enabled: hasCategories,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const invalidateEquipmentQueries = async (modelId) => {
    const invalidations = [
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.adminModelLists(),
      }),
    ];

    if (Number.isInteger(modelId)) {
      invalidations.push(
        queryClient.invalidateQueries({
          queryKey: equipmentKeys.adminModel(modelId),
        }),
      );
    }

    await Promise.allSettled(invalidations);
  };

  const settingMutation = useMutation({
    mutationFn: saveSemester,
    onSuccess: (_result, values) => {
      queryClient.setQueryData(["semester", "schedule"], (schedule) => ({
        previous: schedule?.previous ?? null,
        current: { ...schedule?.current, ...values },
        next: schedule?.next ?? null,
      }));
      setIsSettingModalOpen(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: createAdminEquipmentModel,
  });

  const imageUploadMutation = useMutation({
    mutationFn: uploadAdminEquipmentModelImage,
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminEquipmentModel,
    onError: (error) => {
      setFeedback({
        type: "operation-error",
        message: getUpdateModelErrorMessage(error),
      });
    },
  });

  const disposeMutation = useMutation({
    mutationFn: disposeAdminEquipmentModel,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
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
    onSettled: () => { disposeSubmissionGuardRef.current = false; },
  });

  const isCreateFlowPending =
    createMutation.isPending || imageUploadMutation.isPending;
  const isMutationPending =
    isCreateFlowPending ||
    updateMutation.isPending ||
    disposeMutation.isPending;
  const categoryLabels = Object.fromEntries(
    categoryOptions.map((category) => [
      String(category.categoryId),
      category.label,
    ]),
  );
  const categoryCounts = equipmentQuery.data?.categoryCounts ?? {};
  const hasCategoryCount = (key) =>
    Object.prototype.hasOwnProperty.call(categoryCounts, String(key));
  const tabItems = [
    {
      ...ALL_CATEGORY_OPTION,
      count: isMockMode
        ? categoryCounts.all
        : hasCategoryCount("all")
          ? categoryCounts.all
          : undefined,
      controlsId: panelId,
      disabled: !hasCategories,
    },
    ...categoryOptions.map((category) => ({
      ...category,
      count: isMockMode
        ? categoryCounts[String(category.categoryId)] ?? 0
        : hasCategoryCount(category.categoryId)
          ? categoryCounts[String(category.categoryId)]
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
    if (isCreateFlowPending || createSubmissionGuardRef.current) {
      return;
    }

    const registeredModelId = pendingImageUploadModelIdRef.current;

    if (Number.isInteger(registeredModelId)) {
      void invalidateEquipmentQueries(registeredModelId);
    }

    pendingImageUploadModelIdRef.current = null;
    setPendingImageUploadModelId(null);
    setIsCreateModalOpen(false);
  };

  const handleOpenCreateModal = () => {
    if (isMutationPending) return;
    setIsCreateModalOpen(true);
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

  const handleCreateEquipment = async (values) => {
    if (isCreateFlowPending || createSubmissionGuardRef.current) {
      throw new Error("모델 등록 요청이 진행 중입니다.");
    }

    createSubmissionGuardRef.current = true;

    try {
      if (isMockMode) {
        try {
          const mutationValues = toMutationValues(values);
          const createdModel = await createMutation.mutateAsync(mutationValues);

          await invalidateEquipmentQueries();
          setIsCreateModalOpen(false);
          setFeedback({
            type: "create-success",
            modelId: createdModel.modelId,
          });

          return createdModel;
        } catch (error) {
          setFeedback({
            type: "operation-error",
            message: getCreateModelErrorMessage(error),
          });
          throw error;
        }
      }

      let modelId = pendingImageUploadModelIdRef.current;

      if (!Number.isInteger(modelId)) {
        try {
          const mutationValues = toMutationValues(values);
          const createdModel = await createMutation.mutateAsync(mutationValues);

          modelId = createdModel.modelId;
          pendingImageUploadModelIdRef.current = modelId;
          setPendingImageUploadModelId(modelId);
        } catch (error) {
          setFeedback({
            type: "operation-error",
            message: getCreateModelErrorMessage(error),
          });
          throw error;
        }
      }

      let uploadedModel;

      try {
        uploadedModel = await imageUploadMutation.mutateAsync({
          modelId,
          imageFile: values.imageFile,
        });
      } catch (error) {
        await invalidateEquipmentQueries(modelId);
        setFeedback({
          type: "image-upload-error",
          message: getErrorMessage(error, "모델 이미지를 업로드하지 못했습니다."),
        });
        throw error;
      }

      await invalidateEquipmentQueries(modelId);
      pendingImageUploadModelIdRef.current = null;
      setPendingImageUploadModelId(null);
      setIsCreateModalOpen(false);
      setFeedback({ type: "create-success", modelId });

      return uploadedModel;
    } finally {
      createSubmissionGuardRef.current = false;
    }
  };

  const handleEquipmentSettings = (values) => {
    if (!isMockMode || settingMutation.isPending) return;
    settingMutation.mutate(values);
  };

  const handleOpenEditModal = async (equipment, event) => {
    if (!canManageModels || isMutationPending || loadingEditModelId !== null) return;
    editButtonRef.current = event.currentTarget;
    if (isMockMode) {
      setEditTargetEquipment(equipment);
      return;
    }

    setLoadingEditModelId(equipment.modelId);
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: equipmentKeys.adminModel(equipment.modelId),
        queryFn: ({ signal }) => getAdminEquipmentModelByID(equipment.modelId, { signal }),
        staleTime: 0,
      });
      const category = categoryOptions.find(
        (option) => String(option.categoryId) === String(equipment.categoryId),
      );
      if (!category) throw new Error("모델의 카테고리를 확인할 수 없습니다.");
      setEditTargetEquipment({
        ...equipment,
        categoryKey: category.value,
        labelPrefix: detail.labelPrefix,
        name: detail.name,
        description: equipment.description === "-" ? "" : equipment.description,
        specification: equipment.specification === "-" ? "" : equipment.specification,
      });
    } catch (error) {
      setFeedback({
        type: "operation-error",
        message: getErrorMessage(error, "모델 정보를 불러오지 못했습니다."),
      });
    } finally {
      setLoadingEditModelId(null);
    }
  };

  const handleCloseEditModal = () => {
    if (!updateMutation.isPending && !imageUploadMutation.isPending && !updateSubmissionGuardRef.current) {
      pendingEditImageModelIdRef.current = null;
      setPendingEditImageModelId(null);
      setEditTargetEquipment(null);
    }
  };

  const handleUpdateEquipment = async (values) => {
    if (!canManageModels) throw new Error("모델 수정 권한이 없습니다.");
    if (updateSubmissionGuardRef.current) return;
    updateSubmissionGuardRef.current = true;

    try {
      const mutationValues = toMutationValues(values);
      const modelId = mutationValues.modelId;
      if (pendingEditImageModelIdRef.current !== modelId &&
          (isMockMode || values.hasMetadataChanges)) {
        await updateMutation.mutateAsync(mutationValues);
        await queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
      }

      if (!isMockMode && values.replacementImageFile) {
        pendingEditImageModelIdRef.current = modelId;
        setPendingEditImageModelId(modelId);
        try {
          await imageUploadMutation.mutateAsync({
            modelId,
            imageFile: values.replacementImageFile,
          });
        } catch (error) {
          setFeedback({
            type: "edit-image-upload-error",
            metadataSaved: values.hasMetadataChanges,
            message: getErrorMessage(error, "모델 이미지를 업로드하지 못했습니다."),
          });
          throw error;
        }
      }

      await queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
      pendingEditImageModelIdRef.current = null;
      setPendingEditImageModelId(null);
      setEditTargetEquipment(null);
      setFeedback({ type: "edit-success" });
    } finally {
      updateSubmissionGuardRef.current = false;
    }
  };

  const handleOpenDisposeModal = (equipment, event) => {
    if (!canManageModels || isMutationPending || loadingEditModelId !== null) return;
    disposeButtonRef.current = event.currentTarget;
    setDisposeTargetEquipment(equipment);
  };

  const handleCloseDisposeModal = () => {
    if (!disposeMutation.isPending) {
      setDisposeTargetEquipment(null);
    }
  };

  const handleDisposeEquipment = (equipment) => {
    if (!canManageModels || disposeSubmissionGuardRef.current) return;
    disposeSubmissionGuardRef.current = true;
    disposeMutation.mutate({ modelId: equipment.modelId });
  };

  let emptyMessage = normalizedSearchTerm
    ? "검색 조건에 해당하는 기자재가 없습니다."
    : selectedCategory === ALL_CATEGORY_OPTION.value
      ? "등록된 기자재 모델이 없습니다."
      : "선택한 카테고리에 등록된 기자재 모델이 없습니다.";

  const columns = [
    {
      key: "image",
      header: <span className={styles.visuallyHidden}>이미지</span>,
      width: 84,
      render: (equipment) => <EquipmentImageCell equipment={equipment} />,
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
          categoryLabel={
            equipment.categoryName && equipment.categoryName !== "-"
              ? equipment.categoryName
              : categoryLabels[String(equipment.categoryId)] ?? "-"
          }
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
          disabled={!canManageModels || isMutationPending || loadingEditModelId !== null}
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

          {hasCategories && equipmentQuery.isPending ? (
            <p className={styles.modelState}>기자재 목록을 불러오는 중입니다.</p>
          ) : null}
          {loadingEditModelId !== null ? (
            <p className={styles.modelState} role="status">수정할 모델 정보를 불러오는 중입니다.</p>
          ) : null}
          {hasCategories && equipmentQuery.isError ? (
            <div className={styles.modelState} role="alert">
              <p>
                {equipmentQuery.error?.message ||
                  "기자재 목록을 불러오지 못했습니다."}
              </p>
              <Button
                color="Neutral"
                kind="border"
                size="Default"
                status="Default"
                text="다시 시도"
                disabled={equipmentQuery.isFetching}
                onClick={() => equipmentQuery.refetch()}
              />
            </div>
          ) : null}

          {hasCategories && equipmentQuery.isSuccess ? (
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
        isPending={isCreateFlowPending}
        isMetadataLocked={Number.isInteger(pendingImageUploadModelId)}
        categoryOptions={categoryOptions}
        onClose={handleCloseCreateModal}
        onConfirm={handleCreateEquipment}
        returnFocusRef={registerButtonRef}
      />
      {editTargetEquipment ? (
        <EquipmentItemEditModal
          key={editTargetEquipment.modelId}
          isOpen
          isPending={updateMutation.isPending || imageUploadMutation.isPending}
          isMetadataLocked={pendingEditImageModelId === editTargetEquipment.modelId}
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
        secondaryDescription={
          isMockMode
            ? "기자재 모델 상세페이지에서 기기를 등록해주세요."
            : undefined
        }
        confirmText="확인"
        showCancel={false}
        onClose={() => setFeedback(null)}
        onConfirm={() => setFeedback(null)}
        returnFocusRef={registerButtonRef}
      />
      <ConfirmModal
        isOpen={feedback?.type === "image-upload-error"}
        icon="warning"
        title="이미지 업로드 실패"
        description="모델 정보는 등록됐지만 이미지 업로드에 실패했습니다."
        secondaryDescription={feedback?.message}
        confirmText="확인"
        confirmColor="Danger"
        showCancel={false}
        onClose={() => setFeedback(null)}
        onConfirm={() => setFeedback(null)}
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
        isOpen={feedback?.type === "edit-image-upload-error"}
        icon="warning"
        title="이미지 업로드 실패"
        description={feedback?.metadataSaved
          ? "모델 정보는 수정됐지만 이미지 업로드에 실패했습니다. 수정 모달에서 이미지만 다시 시도해 주세요."
          : "이미지 업로드에 실패했습니다. 수정 모달에서 이미지만 다시 시도해 주세요."}
        secondaryDescription={feedback?.message}
        confirmText="확인"
        confirmColor="Danger"
        showCancel={false}
        onClose={() => setFeedback(null)}
        onConfirm={() => setFeedback(null)}
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
