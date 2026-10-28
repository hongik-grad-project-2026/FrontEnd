import { useId, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoaderData, useParams } from "react-router-dom";

import { isMockMode } from "../../api/client";
import {
  createAdminEquipmentItems,
  disposeAdminEquipmentItem,
  equipmentKeys,
  getAdminEquipmentItemCounts,
  getAdminEquipmentItems,
  updateAdminEquipmentItem,
} from "../../api/equipmentApi";

import Button from "../../components/common/Button";
import IconButton from "../../components/common/IconButton";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import AssetDisposeModal from "../../components/modal/AssetDisposeModal";
import AssetFormModal from "../../components/modal/AssetFormModal";
import AssetResultModal from "../../components/modal/AssetResultModal";
import DataTable from "../../components/table/DataTable";

import styles from "./AdminAssetListPage.module.css";

const PAGE_SIZE = 10;

const ASSET_TABS = [
  { value: "all", label: "전체" },
  { value: "available", label: "대여 가능" },
  { value: "rented", label: "대여 중" },
  { value: "broken", label: "고장" },
  { value: "disposalScheduled", label: "폐기 예정" },
];

const ASSET_BADGE_STATUS = {
  available: "기기-대여가능",
  rented: "기기-대여중",
  broken: "기기-대여중지",
  disposalScheduled: "기기-폐기예정",
};

function getErrorMessage(error, fallbackMessage) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function SingleLineCell({ text }) {
  return (
    <span className={styles.singleLineText} title={text || undefined}>
      {text || "-"}
    </span>
  );
}

function NotesCell({ notes }) {
  return (
    <span className={styles.notesText} title={notes || undefined}>
      {notes || "-"}
    </span>
  );
}

function AdminAssetListPage() {
  const { modelId } = useParams();
  const modelSummary = useLoaderData();
  const queryClient = useQueryClient();

  const panelId = useId();
  const lastActionTriggerRef = useRef(null);

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [resultModal, setResultModal] = useState(null);

  const {
    data: itemPage,
    isPending: isItemsPending,
    isFetching: isItemsFetching,
    isError: isItemsError,
  } = useQuery({
    queryKey: equipmentKeys.adminItems({
      modelId,
      status: selectedStatus,
      keyword,
      page: currentPage - 1,
      size: PAGE_SIZE,
    }),
    queryFn: ({ signal }) =>
      getAdminEquipmentItems({
        modelId,
        status: selectedStatus,
        keyword,
        page: currentPage - 1,
        size: PAGE_SIZE,
        signal,
      }),
    enabled: isMockMode && Boolean(modelId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: itemCounts, isError: isCountsError } = useQuery({
    queryKey: equipmentKeys.adminItemCounts(modelId),
    queryFn: ({ signal }) =>
      getAdminEquipmentItemCounts(modelId, { signal }),
    enabled: isMockMode && Boolean(modelId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const invalidateEquipmentQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.adminItemLists(modelId),
      }),
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.adminItemCounts(modelId),
      }),
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.adminModelLists(),
      }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createAdminEquipmentItems,
    onSuccess: async (result) => {
      await invalidateEquipmentQueries();
      setActiveModal(null);
      setSelectedAsset(null);

      setResultModal({
        variant: "success",
        title: "등록 완료",
        details: result,
        keepParentOpen: false,
      });
    },
    onError: (error) => {
      setResultModal({
        variant: "danger",
        title: "등록 실패",
        description: getErrorMessage(
          error,
          "기기 등록 요청을 처리하지 못했습니다.",
        ),
        keepParentOpen: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminEquipmentItem,
    onSuccess: async () => {
      await invalidateEquipmentQueries();
      setActiveModal(null);
      setSelectedAsset(null);

      setResultModal({
        variant: "success",
        title: "수정 완료",
        description: "정상적으로 수정 처리되었습니다.",
        keepParentOpen: false,
      });
    },
    onError: (error) => {
      setResultModal({
        variant: "danger",
        title: "수정 실패",
        description: getErrorMessage(
          error,
          "기기 수정 요청을 처리하지 못했습니다.",
        ),
        keepParentOpen: true,
      });
    },
  });

  const disposeMutation = useMutation({
    mutationFn: disposeAdminEquipmentItem,
    onSuccess: async () => {
      await invalidateEquipmentQueries();
      setActiveModal(null);
      setSelectedAsset(null);

      setResultModal({
        variant: "success",
        title: "폐기 완료",
        description: "정상적으로 폐기 처리되었습니다.",
        keepParentOpen: false,
      });
    },
    onError: (error) => {
      setResultModal({
        variant: "neutral-warning",
        title: "폐기 불가능 상태입니다",
        description: getErrorMessage(
          error,
          "현재 상태에서는 기기를 폐기할 수 없습니다.",
        ),
        keepParentOpen: true,
      });
    },
  });

  const tabItems = ASSET_TABS.map((tab) => ({
    ...tab,
    count: itemCounts?.[tab.value],
    controlsId: panelId,
  }));

  const selectedTab = tabItems.find((tab) => tab.value === selectedStatus);

  const visibleItems = itemPage?.content ?? [];

  const totalPages = Math.max(1, itemPage?.totalPages ?? 0);

  const resolvedCurrentPage = itemPage ? itemPage.page + 1 : currentPage;

  const modelName = modelSummary?.name ?? "개별 기자재";

  let emptyMessage = keyword.trim()
    ? "검색 조건에 해당하는 개별 기자재가 없습니다."
    : selectedStatus === "all"
      ? "표시할 개별 기자재가 없습니다."
      : "선택한 상태에 해당하는 개별 기자재가 없습니다.";

  if (!isMockMode) {
    emptyMessage = "개별 기자재 API가 아직 제공되지 않았습니다.";
  } else if (!modelId) {
    emptyMessage = "조회할 기자재 모델 정보가 없습니다.";
  } else if (isItemsPending) {
    emptyMessage = "개별 기자재 목록을 불러오는 중입니다.";
  } else if (isItemsError) {
    emptyMessage = "개별 기자재 목록을 불러오지 못했습니다.";
  }

  const handleStatusChange = (nextStatus) => {
    setSelectedStatus(nextStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setKeyword(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (inputText) => {
    setKeyword(inputText);
    setCurrentPage(1);
  };

  const handleOpenCreate = (event) => {
    if (!isMockMode || createMutation.isPending) {
      return;
    }

    lastActionTriggerRef.current = event.currentTarget;
    setSelectedAsset(null);
    setActiveModal("create");
  };

  const handleOpenEdit = (asset, event) => {
    event.stopPropagation();

    if (!isMockMode || updateMutation.isPending) {
      return;
    }

    lastActionTriggerRef.current = event.currentTarget;
    setSelectedAsset(asset);
    setActiveModal("edit");
  };

  const handleOpenDispose = (asset, event) => {
    event.stopPropagation();

    if (!isMockMode || disposeMutation.isPending) {
      return;
    }

    lastActionTriggerRef.current = event.currentTarget;
    setSelectedAsset(asset);
    setActiveModal("dispose");
  };

  const handleCloseActiveModal = () => {
    if (
      createMutation.isPending ||
      updateMutation.isPending ||
      disposeMutation.isPending
    ) {
      return;
    }

    setActiveModal(null);
    setSelectedAsset(null);
  };

  const handleCloseResultModal = () => {
    setResultModal(null);
  };

  const columns = [
    // {
    //   key: "assetNumber",
    //   header: "비품 번호",
    //   width: 120,
    //   render: (item) => <SingleLineCell text={item.assetNumber} />,
    // },
    {
      key: "labelNumber",
      header: "라벨 번호",
      width: 120,
      render: (item) => <SingleLineCell text={item.labelNumber} />,
    },
    {
      key: "status",
      header: "상태",
      width: 120,
      render: (item) => (
        <StatusBadge status={ASSET_BADGE_STATUS[item.status]} size="lg" />
      ),
    },
    {
      key: "notes",
      header: "특이사항",
      render: (item) => <NotesCell notes={item.notes} />,
    },
    {
      key: "edit",
      header: "수정",
      width: 52,
      align: "center",
      render: (item) => (
        <IconButton
          icon="edit"
          size={24}
          ariaLabel={`${item.assetNumber} 기기 수정`}
          onClick={(event) => handleOpenEdit(item, event)}
        />
      ),
    },
    {
      key: "dispose",
      header: "폐기",
      width: 52,
      align: "center",
      render: (item) => (
        <IconButton
          icon="trash"
          size={24}
          ariaLabel={`${item.assetNumber} 기기 폐기`}
          onClick={(event) => handleOpenDispose(item, event)}
        />
      ),
    },
  ];

  return (
    <>
      <section className={styles.page}>
        <h2 className={styles.modelName}>{modelName}</h2>

        <div
          className={styles.contentViewport}
          role="region"
          aria-label="개별 기자재 목록 영역"
        >
          <div className={styles.content}>
            <div className={styles.toolbar}>
              <Tabs
                className={styles.statusTabs}
                items={tabItems}
                value={selectedStatus}
                onChange={handleStatusChange}
                ariaLabel="개별 기자재 상태"
              />

              <SearchBar
                className={styles.search}
                width={360}
                name="assetKeyword"
                value={keyword}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                ariaLabel="라벨 번호 검색"
                placeholder="검색어를 입력하세요."
                disabled={!isMockMode}
              />
            </div>

            <div
              id={panelId}
              className={styles.tablePanel}
              role="tabpanel"
              aria-label={`${selectedTab?.label ?? "전체"} 개별 기자재 목록`}
              aria-busy={isItemsFetching}
            >
              {!modelId ? (
                <p className={styles.errorMessage} role="alert">
                  URL에서 기자재 모델 ID를 확인할 수 없습니다.
                </p>
              ) : null}

              {isCountsError ? (
                <p className={styles.errorMessage} role="alert">
                  상태별 개수를 불러오지 못했습니다.
                </p>
              ) : null}

              {isItemsError && itemPage ? (
                <p className={styles.errorMessage} role="alert">
                  목록을 새로 불러오지 못했습니다. 이전 조회 결과를 표시합니다.
                </p>
              ) : null}

              <DataTable
                className={styles.dataTable}
                ariaLabel={`${modelName} 개별 기자재 목록`}
                columns={columns}
                rows={visibleItems}
                getRowId={(item) => item.itemId}
                minWidth={1120}
                emptyMessage={emptyMessage}
              />
            </div>

            <div className={styles.footer}>
              <Pagination
                page={resolvedCurrentPage}
                totalPages={totalPages}
                onChange={setCurrentPage}
                ariaLabel="개별 기자재 목록 페이지 이동"
              />

              <Button
                className={styles.createButton}
                kind="border"
                size="Default"
                color="Primary"
                status="Default"
                text="기기 등록"
                type="button"
                disabled={!isMockMode || !modelId}
                onClick={handleOpenCreate}
              />
            </div>
          </div>
        </div>
      </section>

      <AssetFormModal
        mode="create"
        modelId={modelId}
        modelName={modelName}
        labelPrefix={modelSummary?.labelPrefix}
        isOpen={activeModal === "create"}
        isPending={createMutation.isPending}
        onClose={handleCloseActiveModal}
        onConfirm={(values) => createMutation.mutate(values)}
        returnFocusRef={lastActionTriggerRef}
      />

      <AssetFormModal
        mode="edit"
        asset={selectedAsset}
        modelId={modelId}
        modelName={modelName}
        labelPrefix={modelSummary?.labelPrefix}
        isOpen={activeModal === "edit" && selectedAsset !== null}
        isPending={updateMutation.isPending}
        onClose={handleCloseActiveModal}
        onConfirm={(values) => updateMutation.mutate(values)}
        returnFocusRef={lastActionTriggerRef}
      />

      <AssetDisposeModal
        asset={selectedAsset}
        modelName={modelName}
        isOpen={activeModal === "dispose" && selectedAsset !== null}
        isPending={disposeMutation.isPending}
        onClose={handleCloseActiveModal}
        onConfirm={(values) => disposeMutation.mutate(values)}
        returnFocusRef={lastActionTriggerRef}
      />

      <AssetResultModal
        isOpen={resultModal !== null}
        variant={resultModal?.variant}
        title={resultModal?.title}
        description={resultModal?.description}
        secondaryDescription={resultModal?.secondaryDescription}
        details={resultModal?.details}
        onClose={handleCloseResultModal}
        returnFocusRef={
          resultModal?.keepParentOpen ? undefined : lastActionTriggerRef
        }
      />
    </>
  );
}

export default AdminAssetListPage;
