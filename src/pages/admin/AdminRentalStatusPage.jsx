import { useState } from "react";
import RentalCard from "../../components/card/RentalCard";
import Button from "../../components/common/Button";
import Tabs from "../../components/common/Tabs";

// 카드 배치 확인용 임시 데이터
// 실제 서버 API 응답 구조가 아님
const temporaryRentals = [
  {
    id: "preview-waiting",
    status: "waiting",
    ariaLabel: "수령대기 대여 카드",
  },
  {
    id: "preview-renting",
    status: "renting",
    ariaLabel: "대여중 대여 카드",
  },
  {
    id: "preview-overdue",
    status: "overdue",
    ariaLabel: "연체 대여 카드",
  },
];

// 임시 카드 확인용 버튼 조합
// Button의 props는 피그마 속성명, 값 그대로 가져옴
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

  // 탭 확인용 임시 개수
  // 실제 API 연결 후 서버에서 받은 개수로 교체하면 됨
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

  const visibleRentals = temporaryRentals.filter((rental) =>
    isVisibleInTab(rental, activeTab),
  );

  return (
    <div>
      <h1>대여 현황</h1>

      <div>
        <div>
          <Tabs
            items={rentalStatusTabs}
            value={activeTab}
            onChange={setActiveTab}
            ariaLabel="대여 현황"
          />
        </div>

        <section aria-label="대여 목록">
          {visibleRentals.map((rental) => {
            const primaryButton = primaryButtonByStatus[rental.status];

            return (
              <RentalCard
                key={rental.id}
                ariaLabel={rental.ariaLabel}
                /*
                  StatusBadge 공통 컴포넌트 완성 후 부모 페이지에서 badge prop으로 전달

                  badge={
                    <StatusBadge
                      props 전달
                    />
                  }
                */
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
                {/*
                  내부 텍스트 공통 컴포넌트 완성 후 여기에 렌더링
                  
                */}
              </RentalCard>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default AdminRentalStatusPage;
