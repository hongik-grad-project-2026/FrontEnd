import { useRef, useState } from "react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useUser } from "../../context/UserContext";
import RentalCard from "../../components/card/RentalCard";
import RentalCardInfo from "../../components/card/RentalCardInfo";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/layout/PageHeader";
import ConfirmModal from "../../components/modal/ConfirmModal";
import RentalDetailModal from "../../components/modal/RentalDetailModal";
import styles from "./AdminRentalStatusPage.module.css";

const previewEquipmentInfo = {
  category: "노트북",
  equipmentName: "HP Elite x360 1040 G10 2-in-1",
  rentalId: "123456789",
};

// 상세 모달 화면 확인용 임시 데이터
// 실제 서버 API 응답 구조를 의미하지 않음
const previewRentalDetail = {
  studentName: "김홍익",
  studentId: "C000000",
  studentEmail: "example@g.hongik.ac.kr",
  studentPhone: "010-0000-0000",
  department: "컴퓨터공학과",
  description: "기자재 설명이 들어갑니다.",
  accessories: "본체, 파우치, 충전선",
  rentalType: "장기",
  requestedAt: "2026.03.06. 09:00:00",
  expectedPickupAt: "2026.03.04. 19:00",
  expectedReturnAt: "2026.05.06. 17:00",
  reason:
    "대여 사유가 들어갑니다. 대여 사유가 들어갑니다. 대여 사유가 들어갑니다. 대여 사유가 들어갑니다.",
  approvedAt: "2026.03.03. 18:00:00",
  assetNumber: "000000",
};

// 카드 배치 확인용 임시 데이터
// 실제 서버 API 응답 구조가 아님
const temporaryRentals = [
  {
    id: "preview-waiting",
    status: "waiting",
    ariaLabel: "수령대기 대여 카드",
    ...previewEquipmentInfo,
    ...previewRentalDetail,
    actualPickupAt: null,
    infoFields: [
      {
        id: "student",
        label: "학생 정보",
        value: "김홍익 (C000000)",
      },
      {
        id: "scheduled-pickup",
        label: "수령 예정일",
        value: "2026.03.04. 19:00",
        underlined: true,
      },
      {
        id: "scheduled-return",
        label: "반납 예정일",
        value: "2026.05.06. 17:00",
      },
      {
        id: "rental-reason",
        label: "대여 사유",
        value: "대여 사유가 들어갑니다. 대여 ...",
      },
    ],
  },
  {
    id: "preview-renting",
    status: "renting",
    ariaLabel: "대여중 대여 카드",
    ...previewEquipmentInfo,
    ...previewRentalDetail,
    actualPickupAt: "2026.03.04. 19:00",
    infoFields: [
      {
        id: "student",
        label: "학생 정보",
        value: "김홍익 (C000000)",
      },
      {
        id: "rental-requested-at",
        label: "대여 신청일",
        value: "2026.03.06. 09:00:00",
      },
      {
        id: "picked-up-at",
        label: "수령일",
        value: "2026.03.04. 19:00",
      },
      {
        id: "scheduled-return",
        label: "반납 예정일",
        value: "2026.05.06. 17:00",
        underlined: true,
      },
    ],
  },
  {
    id: "preview-overdue",
    status: "overdue",
    ariaLabel: "연체 대여 카드",
    ...previewEquipmentInfo,
    ...previewRentalDetail,
    actualPickupAt: "2026.03.04. 19:00",
    infoFields: [
      {
        id: "student",
        label: "학생 정보",
        value: "김홍익 (C000000)",
      },
      {
        id: "rental-requested-at",
        label: "대여 신청일",
        value: "2026.03.06. 09:00:00",
      },
      {
        id: "picked-up-at",
        label: "수령일",
        value: "2026.03.04. 19:00",
      },
      {
        id: "scheduled-return",
        label: "반납 예정일",
        value: "2026.05.06. 17:00",
        underlined: true,
        tone: "danger",
      },
    ],
  },
];

// 화면 확인용 임시 조회 함수
// 실제 기자재 API와 연결된 함수가 아님
async function fetchTemporaryRentals({ pageParam }) {
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });

  const items = temporaryRentals.map((rental, index) => ({
    ...rental,
    id: `${rental.id}-page-${pageParam}-${index}`,
    rentalId: `${rental.rentalId}-${pageParam}-${index}`,
  }));

  const hasNextPage = pageParam < 4;

  return {
    items,
    nextPage: hasNextPage ? pageParam + 1 : undefined,
  };
}

const primaryButtonByStatus = {
  waiting: {
    text: "수령 처리하기",
    kind: "fill",
    color: "Primary",
  },
  renting: {
    text: "반납 처리하기",
    kind: "fill",
    color: "Primary",
  },
  overdue: {
    text: "반납 처리하기",
    kind: "border",
    color: "Danger",
  },
};

const badgeStatusByRentalStatus = {
  waiting: "대여-수령대기",
  renting: "대여-대여중",
  overdue: "대여-연체",
};

function isVisibleInTab(rental, activeTab) {
  if (activeTab === "all") {
    return true;
  }

  if (activeTab === "waiting") {
    return rental.status === "waiting";
  }

  return rental.status === "renting" || rental.status === "overdue";
}

function AdminRentalStatusPage() {
  const modalTriggerRef = useRef(null);
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailModalState, setDetailModalState] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);

  const {
    items: rentalItems,
    loadMoreRef,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteScroll({
    queryKey: ["admin-rentals"],
    queryFn: fetchTemporaryRentals,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // 탭 표시 확인용 임시 개수
  // 실제 API 연결 후 서버에서 받은 값으로 교체
  const rentalCounts = {
    waiting: 10,
    renting: 10,
    overdue: 2,
  };

  const rentalStatusTabs = [
    {
      value: "all",
      label: "전체",
      count: rentalCounts.waiting + rentalCounts.renting,
    },
    {
      value: "waiting",
      label: "수령대기",
      count: rentalCounts.waiting,
    },
    {
      value: "renting",
      label: "대여중",
      count: rentalCounts.renting,
      badge: rentalCounts.overdue > 0 ? "⚠ 연체" : null,
    },
  ];

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredRentals = rentalItems.filter((rental) => {
    const matchesTab = isVisibleInTab(rental, activeTab);

    const matchesSearch =
      !normalizedSearchTerm ||
      rental.equipmentName.toLowerCase().includes(normalizedSearchTerm);

    return matchesTab && matchesSearch;
  });

  const visibleRentals =
    activeTab === "renting"
      ? [...filteredRentals].sort((firstRental, secondRental) => {
          const firstIsOverdue = firstRental.status === "overdue";
          const secondIsOverdue = secondRental.status === "overdue";

          return Number(secondIsOverdue) - Number(firstIsOverdue);
        })
      : filteredRentals;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (inputText) => {
    setSearchTerm(inputText);
  };

  const handleOpenDetailModal = (rental, event) => {
    modalTriggerRef.current = event.currentTarget;

    setDetailModalState({
      initialMode: "detail",
      rental,
    });
  };

  const handleOpenProcessModal = (rental, event) => {
    modalTriggerRef.current = event.currentTarget;

    setDetailModalState({
      initialMode: "process",
      rental,
    });
  };

  const handleCloseDetailModal = () => {
    setDetailModalState(null);
  };

  const handleCompleteRentalProcess = ({ processType }) => {
    // 실제 수령·반납 API와 목록 상태 변경은 아직 연결하지 않음
    setDetailModalState(null);

    setFeedbackType(
      processType === "pickup" ? "pickup-success" : "return-success",
    );
  };

  const handleCloseFeedback = () => {
    setFeedbackType(null);
  };

  return (
    <div className={styles.adminRentalStatusPage}>
      <PageHeader />

      <div
        className={styles.contentViewport}
        role="region"
        aria-label="대여 현황 목록 영역"
      >
        <div className={styles.content}>
          <div className={styles.toolsContainer}>
            <Tabs
              className={styles.statusTabs}
              items={rentalStatusTabs}
              value={activeTab}
              onChange={setActiveTab}
              ariaLabel="대여 현황"
            />

            <SearchBar
              className={styles.search}
              name="rentalStatusSearch"
              width={360}
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              ariaLabel="대여 현황 기자재명 검색"
              placeholder="기자재명으로 검색..."
            />
          </div>

          <section className={styles.cardListContainer} aria-label="대여 목록">
            {isError ? <p>대여 목록을 불러오지 못했습니다.</p> : null}

            {!isLoading && !isError && visibleRentals.length === 0 ? (
              <p>검색 조건에 해당하는 대여 현황이 없습니다.</p>
            ) : null}

            {visibleRentals.map((rental) => {
              const primaryButton = primaryButtonByStatus[rental.status];
              const badgeStatus = badgeStatusByRentalStatus[rental.status];

              return (
                <RentalCard
                  key={rental.id}
                  ariaLabel={rental.ariaLabel}
                  badge={<StatusBadge status={badgeStatus} />}
                  actions={
                    <>
                      <Button
                        kind={primaryButton.kind}
                        status="Default"
                        size="Default"
                        color={primaryButton.color}
                        showLeftIcon={false}
                        text={primaryButton.text}
                        type="button"
                        onClick={(event) =>
                          handleOpenProcessModal(rental, event)
                        }
                      />

                      <Button
                        kind="border"
                        status="Default"
                        size="Default"
                        color="Primary"
                        showLeftIcon={false}
                        text="상세 보기"
                        type="button"
                        onClick={(event) =>
                          handleOpenDetailModal(rental, event)
                        }
                      />
                    </>
                  }
                >
                  <RentalCardInfo
                    category={rental.category}
                    equipmentName={rental.equipmentName}
                    rentalId={rental.rentalId}
                    fields={rental.infoFields}
                  />
                </RentalCard>
              );
            })}

            <div ref={loadMoreRef} aria-hidden="true" />

            {isFetchingNextPage ? <p>더 불러오는 중...</p> : null}

            {!hasNextPage && !isLoading ? <p>마지막 목록입니다.</p> : null}
          </section>
        </div>
      </div>

      {detailModalState ? (
        <RentalDetailModal
          key={`${detailModalState.rental.id}-${detailModalState.initialMode}`}
          isOpen
          initialMode={detailModalState.initialMode}
          rental={detailModalState.rental}
          workerName={user?.name ?? ""}
          onClose={handleCloseDetailModal}
          onComplete={handleCompleteRentalProcess}
          returnFocusRef={modalTriggerRef}
        />
      ) : null}

      <ConfirmModal
        isOpen={feedbackType === "pickup-success"}
        icon="checkmark"
        title="수령 처리되었습니다."
        description="대여중 상태에서 확인 가능합니다."
        confirmText="확인"
        showCancel={false}
        onClose={handleCloseFeedback}
        onConfirm={handleCloseFeedback}
        returnFocusRef={modalTriggerRef}
      />

      <ConfirmModal
        isOpen={feedbackType === "return-success"}
        icon="checkmark"
        title="반납 처리되었습니다."
        description="대여기록 페이지에서 확인 가능합니다."
        confirmText="확인"
        showCancel={false}
        onClose={handleCloseFeedback}
        onConfirm={handleCloseFeedback}
        returnFocusRef={modalTriggerRef}
      />
    </div>
  );
}

export default AdminRentalStatusPage;
