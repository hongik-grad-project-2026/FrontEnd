import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchNotices, noticeKeys } from '../../api/noticeApi';
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"

import { getMyWishlistedEquipmentModels } from "../../api/equipmentApi"

import StatusBadge from "../../components/common/StatusBadge";
import EquipmentCard from "../../components/card/EquipmentCard"
import PageHeader from "../../components/layout/PageHeader"
import { IconTextButton } from "../../components/common/IconButton";
import AccordionItem from "../../components/common/AccordionItem";


import styles from "./StudentDashboardPage.module.css"

const mockRentalList = [
  { id: 1, status: "승인대기", modelName: "Sony A7 IV" },
  {
    id: 2,
    status: "승인대기",
    modelName: "Canon EOS R6 Mark II",
  },
  {
    id: 3,
    status: "승인대기",
    modelName: "Zoom H6 레코더",
  },
  {
    id: 4,
    status: "승인대기",
    modelName: "Zoom H6 레코더",
  },
  {
    id: 5,
    status: "수령대기",
    modelName: "FE 24-70mm F2.8",
    expectedPickupAt: "2026-09-20T14:00:00",
  },
  {
    id: 6,
    status: "수령대기",
    modelName: "무선 핀마이크",
    expectedPickupAt: "2026-09-21T10:30:00",
  },
  {
    id: 9,
    status: "대여중",
    modelName: "DJI RS 3 짐벌",
    expectedReturnAt: "2026-09-20",
    returnDday: 2,
  },

]


function formatPickupDateTime(dateTime) {
  const [date, time] = dateTime.split("T");
  return `${date.replaceAll("-", ".")} ${time}`;
}

function formatReturnDate(date) {
  return date.replaceAll("-", ".");
}


function NoticeArea() {

  const {
    data,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: noticeKeys.list({ important: null, page: 0, size: 5 }),
    queryFn: () =>
      fetchNotices({
        page: 0,
        size: 5,
      }),
  });

  const notices = data?.content ?? [];

  if (isLoading) {
    return <p className={styles.noticeState}>공지사항을 불러오는 중입니다.</p>;
  }

  if (isError) {
    return (
      <div className={styles.noticeState} role="alert">
        <p>{error?.message || "공지사항을 불러오지 못했습니다."}</p>
        <IconTextButton
          icon="rotate"
          text={isFetching ? "다시 시도 중" : "다시 시도"}
          disabled={isFetching}
          onClick={() => refetch()}
        />
      </div>
    );
  }

  if (notices.length === 0) {
    return <p className={styles.noticeState}>등록된 공지사항이 없습니다.</p>;
  }

  return (
    <div>
      {notices.map((notice) => {
        const hasAttachments = notice.hasAttachment ? true : false;
        const formattedDate = notice.createdAt
          ? notice.createdAt.split("T")[0].replace(/-/g, ".")
          : "-";

        return (<AccordionItem
          key={notice.noticeId}
          noticeId={notice.noticeId}
          detailPath={`/student/notices/${notice.noticeId}`}
          isImportant={notice.important}
          title={notice.title}
          hasAttachments={hasAttachments}
          createdAt={formattedDate}
          content={notice.summary}
        />)
      })}

    </div>
  );
}


function RentalsLi({ rental }) {
  return (
    <li className={styles.rentalsLi} data-rantalstatus={rental.status}>
      <div >
        <span className={styles.liModelName}>{rental.modelName}</span>
      </div>
      {rental.status === "수령대기" && (
        <span className={styles.liDateInfo}>{formatPickupDateTime(rental.expectedPickupAt)}</span>
      )}
      {rental.status === "대여중" && (
        <span className={styles.liDateInfo}>
          {formatReturnDate(rental.expectedReturnAt)} (D-{rental.returnDday})
        </span>
      )}
    </li>
  );
}

function StudentDashboardPage() {
  const navigate = useNavigate();
  const [wishOverrides, setWishOverrides] = useState({});
  const rentalGroups = {
    "승인대기": mockRentalList.filter((rental) => rental.status === "승인대기"),
    "수령대기": mockRentalList.filter((rental) => rental.status === "수령대기"),
    "대여중": mockRentalList.filter((rental) => rental.status === "대여중"),
  };

  function handleWishChange(equipmentId, nextIsWish) {
    setWishOverrides((current) => ({
      ...current,
      [equipmentId]: nextIsWish,
    }));
  }

  const {
    items,
    loadMoreRef,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteScroll({
    queryKey: ["equipment-models", "my-wishlist"],
    queryFn: ({ pageParam }) =>
      getMyWishlistedEquipmentModels({ page: pageParam, size: 12 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });

  return (
    <main className={styles.dashboardPage}>
      <PageHeader />
      <section className={styles.section} >
        <div className={styles.sectionHead}>
          <h3>공지사항</h3>
          <IconTextButton
            icon={'logout'}
            size={32}
            text={'전체 공지사항'}
            onClick={() => navigate("/student/notices")}
          />
        </div>
        <div className={styles.contentArea}>
          <NoticeArea />
        </div>
      </section>

      <section className={styles.section} >
        <h3>대여 현황</h3>
        <div className={styles.rentalsGrid}>
          <div className={`${styles.contentArea} ${styles.rentalStatusBox}`}>
            <StatusBadge status='대여-승인대기' size='md' />
            <ul>
              {rentalGroups["승인대기"].slice(0, 2).map((rental) => (
                <RentalsLi key={rental.id} rental={rental} />
              ))}
              {rentalGroups["승인대기"].length > 2 ? <li className={styles.rentalsCount}><span>+{rentalGroups["승인대기"].length - 2}건</span></li> : ''}
            </ul>
          </div>
          <div className={`${styles.contentArea} ${styles.rentalStatusBox}`}>
            <StatusBadge status='대여-수령대기' size='md' />
            <ul>
              {rentalGroups["수령대기"].slice(0, 2).map((rental) => (
                <RentalsLi key={rental.id} rental={rental} />
              ))}
              {rentalGroups["수령대기"].length > 2 ? <li className={styles.rentalsCount}><span>+{rentalGroups["승인대기"].length - 2}건</span></li> : ''}
            </ul>

          </div>
          <div className={`${styles.contentArea} ${styles.rentalStatusBox}`}>
            <StatusBadge status='대여-대여중' size='md' />
            <ul>
              {rentalGroups["대여중"].slice(0, 2).map((rental) => (
                <RentalsLi key={rental.id} rental={rental} />
              ))}
              {rentalGroups["대여중"].length > 2 ? <li className={styles.rentalsCount}><span>+{rentalGroups["승인대기"].length - 2}건</span></li> : ''}
            </ul>

          </div>
        </div>

      </section>

      <section className={styles.section} >
        <h3>찜목록</h3>
        <div className={styles.wishListGrid}>

          {isLoading ? <p>찜 목록을 불러오는 중입니다.</p> : null}
          {isError ? <p role="alert">찜 목록을 불러오지 못했습니다.</p> : null}

          {items
            .map((equipment) => ({
              ...equipment,
              // 클릭으로 바꾼 임시 상태가 있으면 API 응답의 isWish보다 우선
              isWish: wishOverrides[equipment.id] ?? equipment.isWish,
            }))
            // 찜 해제 버튼을 누른 항목은 서버 변경 API 연결 전까지 현재 화면에서만 숨김
            .filter((equipment) => equipment.isWish)
            .map((equipment) => (
              <EquipmentCard
                key={equipment.id}
                {...equipment}
                onWishChange={(nextIsWish) =>
                  handleWishChange(equipment.id, nextIsWish)
                }
              />
            ))}

          <div ref={loadMoreRef} aria-hidden="true" />
          {isFetchingNextPage ? <p>찜 목록을 더 불러오는 중입니다.</p> : null}
          {!hasNextPage && items.length > 0 ? <p>마지막 찜 항목입니다.</p> : null}
        </div>
      </section>

    </main>

  );
}

export default StudentDashboardPage;
