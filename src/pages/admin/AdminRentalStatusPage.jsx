import { useState } from "react";
import styles from "./AdminRentalStatusPage.module.css";

import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

import PageHeader from "../../components/layout/PageHeader";
import RentalCard from "../../components/card/RentalCard";
import RentalCardInfo from "../../components/card/RentalCardInfo";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";

const previewEquipmentInfo = {
  category: "노트북",
  equipmentName: "HP Elite x360 1040 G10 2-in-1",
  rentalId: "123456789",
};

// 카드 배치 확인용 임시 데이터
// 실제 서버 API 응답 구조가 아님
const temporaryRentals = [
  {
    id: "preview-waiting",
    status: "waiting",
    ariaLabel: "수령대기 대여 카드",
    ...previewEquipmentInfo,
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

// 임시 데이터를 API처럼 반환하는 함수 (실제 API 연결 전 무한스크롤, 로딩 스피너, UI 동작을 확인하기 위함)
async function fetchTemporaryRentals({ pageParam }) {
  // 네트워크 지연 시뮬레이션 (0.3초 가상 로딩 시간)
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });

  // 임시 데이터 ID 고유화
  const items = temporaryRentals.map((rental, index) => ({
    ...rental,
    id: `${rental.id}-page-${pageParam}-${index}`,
    rentalId: `${rental.rentalId}-${pageParam}-${index}`,
  }));

  // 4번까지만 데이터를 불러오고 그 이후에는 스크롤을 멈추도록 테스트 제약
  const hasNextPage = pageParam < 4;

  return {
    items,
    nextPage: hasNextPage ? pageParam + 1 : undefined,
  };
}

// 카드 상태별 기본 버튼
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

// 카드의 임시 상태를 StatusBadge의 공개 status 값으로 변환
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
  const [activeTab, setActiveTab] = useState("all");

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

  // 탭 확인용 임시 개수
  // 실제 API 연결 후 서버에서 받은 개수로 교체
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

  // 무한스크롤 확인을 위해 useInfiniteScroll훅이 합쳐준 rentalItems로 교체
  // const filteredRentals = temporaryRentals.filter((rental) =>
  const filteredRentals = rentalItems.filter((rental) =>
    isVisibleInTab(rental, activeTab),
  );

  // 대여중 탭에서는 연체 카드를 일반 대여중 카드보다 먼저 표시
  const visibleRentals =
    activeTab === "renting"
      ? [...filteredRentals].sort((firstRental, secondRental) => {
        const firstIsOverdue = firstRental.status === "overdue";
        const secondIsOverdue = secondRental.status === "overdue";

        return Number(secondIsOverdue) - Number(firstIsOverdue);
      })
      : filteredRentals;

  return (
    <div className={styles.adminRentalStatusPage}>
      <PageHeader />

      <div className={styles.listViewContainer}>
        <div className={styles.toolsContainer}>
          <Tabs
            items={rentalStatusTabs}
            value={activeTab}
            onChange={setActiveTab}
            ariaLabel="대여 현황"
          />

          <SearchBar placeholder="기자재명으로 검색..." />
        </div>

        <section className={styles.cardListContainer} aria-label="대여 목록"        >
          {isError && <p>대여 목록을 불러오지 못했습니다.</p>}

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
                    />

                    <Button
                      kind="border"
                      status="Default"
                      size="Default"
                      color="Primary"
                      showLeftIcon={false}
                      text="상세 보기"
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

          {isFetchingNextPage && <p>더 불러오는 중...</p>}
          {!hasNextPage && !isLoading && <p>마지막 목록입니다.</p>}
        </section>
      </div>
    </div>
  );
}

export default AdminRentalStatusPage;
