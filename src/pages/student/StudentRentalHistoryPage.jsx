import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { isMockMode } from "../../api/client";
import { equipmentKeys } from "../../api/equipmentApi";
import { RENTAL_STATUS, getRentalStatus } from "../../constants/status";

import {
  cancelStudentRental,
  getStudentRentalCounts,
  getStudentRentals,
  studentRentalKeys,
  rentalKeys,
} from "../../api/rentalApi";
import RentalCard from "../../components/card/RentalCard";
import RentalCardInfo from "../../components/card/RentalCardInfo";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/layout/PageHeader";
import StudentRentalCancelModal from "../../components/modal/StudentRentalCancelModal";
import StudentRentalDetailModal from "../../components/modal/StudentRentalDetailModal";
import layoutStyles from "../admin/AdminRentalStatusPage.module.css";
import styles from "./StudentRentalHistoryPage.module.css";

const LIST_SIZE = 50;
const REJECT_REASON_LABELS = Object.freeze({
  INSUFFICIENT_STOCK: "기기 재고 부족",
  RENTAL_SUSPENDED: "대여 중지된 기기 (기기 고장 등)",
  OTHER: "기타",
});

function shouldRetry(failureCount, error) {
  return error?.code !== "STUDENT_RENTAL_API_UNAVAILABLE" && failureCount < 1;
}

function getRejectionReason(rental) {
  if (rental.rejectReasonType === "OTHER") {
    return rental.rejectReasonDetail || "-";
  }

  return (
    REJECT_REASON_LABELS[rental.rejectReasonType] ??
    rental.rejectReasonDetail ??
    "-"
  );
}

function getCardFields(rental) {
  const commonFields = [
    { id: "rental-type", label: "대여 유형", value: rental.rentalType },
    { id: "requested-at", label: "대여 신청일", value: rental.requestedAt },
  ];

  if (rental.status === "canceled") {
    return [
      ...commonFields,
      { id: "canceled-at", label: "신청 취소일", value: rental.canceledAt },
      { id: "cancel-reason", label: "취소 사유", value: rental.cancelReason },
    ];
  }
  if (rental.status === "noShow") {
    return [
      ...commonFields,
      { id: "no-show", label: "취소 사유", value: "미수령" },
    ];
  }
  if (rental.status === "rejected") {
    return [
      ...commonFields,
      ...(rental.rejectedAt
        ? [{ id: "rejected-at", label: "반려일", value: rental.rejectedAt }]
        : []),
      {
        id: "rejected-reason",
        label: "반려 사유",
        value: getRejectionReason(rental),
      },
    ];
  }

  if (rental.status === "returned") {
    return [
      ...commonFields,
      {
        id: "actual-pickup-at",
        label: "실제 수령일",
        value: rental.actualPickupAt,
      },
      {
        id: "actual-return-at",
        label: "실제 반납일",
        value: rental.actualReturnAt,
      },
    ];
  }

  if (rental.status === "renting" || rental.status === "overdue") {
    return [
      ...commonFields,
      {
        id: "actual-pickup-at",
        label: "실제 수령일",
        value: rental.actualPickupAt,
      },
      {
        id: "expected-return-at",
        label: "반납 예정일",
        value: rental.expectedReturnAt,
        underlined: true,
        tone: rental.status === "overdue" ? "danger" : undefined,
      },
    ];
  }

  return [
    ...commonFields,
    {
      id: "expected-pickup-at",
      label: "수령 예정일",
      value: rental.expectedPickupAt,
    },
    {
      id: "expected-return-at",
      label: "반납 예정일",
      value: rental.expectedReturnAt,
    },
  ];
}

function HighlightedEquipmentName({ name, searchTerm }) {
  const normalizedSearchTerm = searchTerm.trim();

  if (!normalizedSearchTerm) {
    return name;
  }

  const normalizedName = name.toLowerCase();
  const normalizedKeyword = normalizedSearchTerm.toLowerCase();
  const fragments = [];
  let startIndex = 0;
  let matchIndex = normalizedName.indexOf(normalizedKeyword, startIndex);

  while (matchIndex >= 0) {
    if (matchIndex > startIndex) {
      fragments.push(name.slice(startIndex, matchIndex));
    }

    const endIndex = matchIndex + normalizedKeyword.length;
    fragments.push(
      <mark className={styles.searchHighlight} key={`${matchIndex}-${endIndex}`}>
        {name.slice(matchIndex, endIndex)}
      </mark>,
    );
    startIndex = endIndex;
    matchIndex = normalizedName.indexOf(normalizedKeyword, startIndex);
  }

  if (startIndex === 0) {
    return name;
  }

  if (startIndex < name.length) {
    fragments.push(name.slice(startIndex));
  }

  return fragments;
}

function StudentRentalHistoryPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const modalTriggerRef = useRef(null);
  const cancelGuardRef = useRef(false);
  const requestedTab = searchParams.get("status") ?? "all";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState(null);

  const handleTabChange = (nextTab) => {
    setCurrentPage(1);
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextTab === "all") {
      nextSearchParams.delete("status");
    } else {
      nextSearchParams.set("status", nextTab);
    }

    setSearchParams(nextSearchParams);
  };

  const countsQuery = useQuery({
    queryKey: studentRentalKeys.counts(),
    queryFn: ({ signal }) => getStudentRentalCounts({ signal }),
    retry: shouldRetry,
  });

  const cancelMutation = useMutation({ mutationFn: cancelStudentRental });
  const counts = countsQuery.data;
  const countValue = (key) => counts?.[key] ?? "-";
  const rentalTabs = [
    { value: "all", label: "전체", count: countValue("all") },
    ...Object.entries(RENTAL_STATUS)
      .filter(([key]) => !["rejected", "noShow", "canceled", "overdue"].includes(key))
      .map(([key, value]) => ({
        value: key,
        label: value.label,
        count: countValue(key),
        badge: key === "renting" && counts?.overdue > 0 ? "⚠ 연체" : null,
      })),
    { value: "inactive", label: "취소 및 반려", count: countValue("inactive") },
  ];
  const activeTab = rentalTabs.some((tab) => tab.value === requestedTab)
    ? requestedTab
    : "all";

  const listParams = useMemo(
    () => ({
      status: activeTab,
      keyword: searchTerm,
      page: currentPage - 1,
      size: LIST_SIZE,
    }),
    [activeTab, searchTerm, currentPage],
  );

  const listQuery = useQuery({
    queryKey: studentRentalKeys.list(listParams),
    queryFn: ({ signal }) => getStudentRentals({ ...listParams, signal }),
    retry: shouldRetry,
  });

  const rentals = listQuery.data?.content ?? [];
  console.log("-----", rentals);
  const isUnsupported =
    listQuery.error?.code === "STUDENT_RENTAL_API_UNAVAILABLE" ||
    countsQuery.error?.code === "STUDENT_RENTAL_API_UNAVAILABLE";
  const hasListData = Boolean(listQuery.data);
  const isInitialLoading = !hasListData && listQuery.isPending;
  const isInitialError = !hasListData && listQuery.isError;
  const isBackgroundError = hasListData && listQuery.isError;

  const openDetailModal = (rentalId, event) => {
    modalTriggerRef.current = event.currentTarget;
    cancelMutation.reset();
    setModalState({ type: "detail", rentalId });
  };

  const openCancelModalFromCard = (rentalId, event) => {
    modalTriggerRef.current = event.currentTarget;
    cancelMutation.reset();
    setModalState({ type: "cancel", rentalId, source: "card" });
  };

  const openCancelModalFromDetail = (rental) => {
    cancelMutation.reset();
    setModalState({
      type: "cancel",
      rentalId: rental.rentalId,
      source: "detail",
    });
  };

  const closeModal = () => {
    if (cancelMutation.isPending || cancelGuardRef.current) {
      return;
    }

    cancelMutation.reset();
    setModalState(null);
  };

  const goBackFromCancel = () => {
    if (cancelMutation.isPending || cancelGuardRef.current) {
      return;
    }

    cancelMutation.reset();

    if (modalState?.source === "detail") {
      setModalState({ type: "detail", rentalId: modalState.rentalId });
      return;
    }

    setModalState(null);
  };

  const submitCancellation = async (reason) => {
    if (
      !modalState?.rentalId ||
      cancelMutation.isPending ||
      cancelGuardRef.current
    ) {
      return;
    }

    cancelGuardRef.current = true;

    try {
      const canceledRental = await cancelMutation.mutateAsync({
        rentalId: modalState.rentalId,
        reason,
      });

      if (isMockMode) {
        queryClient.setQueryData(
          studentRentalKeys.detail(canceledRental.rentalId),
          canceledRental,
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rentalKeys.all }),
        queryClient.invalidateQueries({ queryKey: equipmentKeys.modelLists() }),
        queryClient.invalidateQueries({ queryKey: equipmentKeys.adminModelLists() }),
        queryClient.invalidateQueries({ queryKey: ["admin", "members"] }),
        queryClient.invalidateQueries({ queryKey: studentRentalKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: studentRentalKeys.counts() }),
        queryClient.invalidateQueries({
          queryKey: studentRentalKeys.detail(canceledRental.rentalId),
        }),
        queryClient.invalidateQueries({
          queryKey: studentRentalKeys.dashboard(),
        }),
      ]);

      setModalState(null);
    } finally {
      cancelGuardRef.current = false;
    }
  };

  const emptyMessage = searchTerm.trim()
    ? "검색 결과가 없습니다."
    : activeTab === "all"
      ? "대여내역이 없습니다."
      : "선택한 상태의 대여내역이 없습니다.";

  return (
    <div className={layoutStyles.adminRentalStatusPage}>
      <PageHeader customTitle="내 대여 내역" />

      <div
        className={layoutStyles.contentViewport}
        role="region"
        aria-label="내 대여 내역 목록 영역"
      >
        {isInitialLoading ? (
          <div className={styles.statePanel}>대여내역을 불러오는 중입니다.</div>
        ) : null}

        {isInitialError && !isUnsupported ? (
          <div className={styles.statePanel} role="alert">
            <p>{listQuery.error?.message || "대여내역을 불러오지 못했습니다."}</p>
            <Button
              kind="border"
              size="Default"
              color="Primary"
              status="Default"
              text={listQuery.isFetching ? "다시 시도 중" : "다시 시도"}
              type="button"
              disabled={listQuery.isFetching}
              onClick={() => {
                listQuery.refetch();
                countsQuery.refetch();
              }}
            />
          </div>
        ) : null}

        {isUnsupported ? (
          <div className={styles.statePanel}>
            대여 API가 아직 제공되지 않았습니다.
          </div>
        ) : null}

        {hasListData && !isUnsupported ? (
          <div className={layoutStyles.content}>
            <div className={layoutStyles.toolsContainer}>
              <Tabs
                className={layoutStyles.statusTabs}
                items={rentalTabs}
                value={activeTab}
                onChange={handleTabChange}
                ariaLabel="학생 대여내역 상태"
              />

              <SearchBar
                className={layoutStyles.search}
                name="studentRentalSearch"
                width={360}
                value={searchTerm}
                onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }}
                onSubmit={(value) => { setSearchTerm(value); setCurrentPage(1); }}
                ariaLabel="대여내역 검색"
                placeholder="기자재명, 카테고리, 대여내역 ID 검색..."
              />
            </div>

            {countsQuery.isError ? (
              <div className={styles.inlineError} role="alert">
                <span>상태별 개수를 불러오지 못했습니다.</span>
                <button
                  type="button"
                  disabled={countsQuery.isFetching}
                  onClick={() => countsQuery.refetch()}
                >
                  {countsQuery.isFetching ? "다시 시도 중" : "다시 시도"}
                </button>
              </div>
            ) : null}

            {isBackgroundError ? (
              <p className={styles.inlineError} role="alert">
                새 목록을 불러오지 못해 이전 목록을 표시하고 있습니다.
              </p>
            ) : null}

            <section
              className={layoutStyles.cardListContainer}
              aria-label="학생 대여 목록"
            >
              {rentals.length === 0 ? (
                <div className={styles.statePanel}>{emptyMessage}</div>
              ) : null}

              {rentals.map((rental) => {
                const status = getRentalStatus(rental.status);
                return (
                  <RentalCard
                    key={rental.rentalId}
                    imageSrc={rental.imageUrl}
                    imageAlt={rental.imageUrl ? rental.equipmentName : ""}
                    ariaLabel={`${rental.equipmentName} 대여내역 카드`}
                    badge={<StatusBadge text={status.label} color={status.color} />}
                    actions={
                      <>
                        {rental.status === "pendingApproval" ? (
                          <Button
                            kind="border"
                            status="Default"
                            size="Default"
                            color="Danger"
                            text="신청 취소하기"
                            type="button"
                            onClick={(event) =>
                              openCancelModalFromCard(rental.rentalId, event)
                            }
                          />
                        ) : null}

                        <Button
                          kind="border"
                          status="Default"
                          size="Default"
                          color="Primary"
                          text="상세 보기"
                          type="button"
                          onClick={(event) =>
                            openDetailModal(rental.rentalId, event)
                          }
                        />
                      </>
                    }
                  >
                    <RentalCardInfo
                      category={rental.category}
                      equipmentName={
                        <HighlightedEquipmentName
                          name={rental.equipmentName}
                          searchTerm={searchTerm}
                        />
                      }
                      rentalId={rental.rentalId}
                      fields={getCardFields(rental)}
                    />
                  </RentalCard>
                )
              })}
            </section>
            {listQuery.data && listQuery.data.totalPages > 1 ? (
              <Pagination
                page={currentPage}
                totalPages={listQuery.data.totalPages}
                onChange={setCurrentPage}
                ariaLabel="학생 대여내역 페이지 이동"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {modalState?.type === "detail" ? (
        <StudentRentalDetailModal
          isOpen
          rentalId={modalState.rentalId}
          onClose={closeModal}
          onRequestCancel={openCancelModalFromDetail}
          returnFocusRef={modalTriggerRef}
        />
      ) : null}

      {modalState?.type === "cancel" ? (
        <StudentRentalCancelModal
          key={`${modalState.rentalId}-${modalState.source}`}
          isOpen
          rentalId={modalState.rentalId}
          error={cancelMutation.error}
          isPending={cancelMutation.isPending}
          onBack={goBackFromCancel}
          onClose={closeModal}
          onSubmit={submitCancellation}
          returnFocusRef={modalTriggerRef}
        />
      ) : null}
    </div>
  );
}

export default StudentRentalHistoryPage;
