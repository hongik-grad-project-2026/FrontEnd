import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode } from "../../api/client";
import { fetchNotices, noticeKeys } from '../../api/noticeApi';
import {
  createStudentRental,
  getStudentRentalDashboard,
  rentalKeys,
  studentRentalKeys,
} from "../../api/rentalApi";
import { categoryKeys, fetchCategories, toCategoryOption } from "../../api/categories";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"

import {
  equipmentKeys,
  getMyWishlistedEquipmentModels,
  setEquipmentModelWishlist,
} from "../../api/equipmentApi"

import StatusBadge from "../../components/common/StatusBadge";
import EquipmentCard from "../../components/card/EquipmentCard"
import PageHeader from "../../components/layout/PageHeader"
import { IconTextButton } from "../../components/common/IconButton";
import AccordionItem from "../../components/common/AccordionItem";
import RentalApplyModal from "../../components/modal/RentalApplyModal";
import { useUser } from "../../context/UserContext";


import styles from "./StudentDashboardPage.module.css"

function formatPickupDateTime(dateTime) {
  if (!dateTime?.includes("T")) {
    return dateTime ?? "-";
  }

  const [date, time] = dateTime.split("T");
  return `${date.replaceAll("-", ".")} ${time}`;
}

function formatReturnDate(date) {
  return date?.replaceAll("-", ".") ?? "-";
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateParts(dateValue) {
  if (typeof dateValue !== "string") {
    return null;
  }

  const matchedDate = dateValue.match(/^(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);

  if (!matchedDate) {
    return null;
  }

  const [, yearText, monthText, dayText] = matchedDate;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function formatReturnDateWithDday(dateValue, today = new Date()) {
  const returnDate = parseDateParts(dateValue);

  if (!returnDate || Number.isNaN(today.getTime())) {
    return "-";
  }

  const returnDay = Date.UTC(
    returnDate.year,
    returnDate.month - 1,
    returnDate.day,
  );
  const todayDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const remainingDays = Math.round(
    (returnDay - todayDay) / MILLISECONDS_PER_DAY,
  );
  const dday =
    remainingDays > 0
      ? `D-${remainingDays}`
      : remainingDays === 0
        ? "D-Day"
        : `D+${Math.abs(remainingDays)}`;

  return `${formatReturnDate(dateValue)} (${dday})`;
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
  const statusLabel = {
    approvalPending: "승인대기",
    pickupPending: "수령대기",
    renting: "대여중",
    overdue: "연체",
  }[rental.status];

  return (
    <li className={styles.rentalsLi} data-rantalstatus={statusLabel}>
      <div >
        <span className={styles.liModelName}>{rental.equipmentName}</span>
      </div>
      {rental.status === "pickupPending" && (
        <span className={styles.liDateInfo}>{formatPickupDateTime(rental.expectedPickupAt)}</span>
      )}
      {(rental.status === "renting" || rental.status === "overdue") && (
        <span className={styles.liDateInfo}>
          {formatReturnDateWithDday(rental.expectedReturnAt)}
        </span>
      )}
    </li>
  );
}

function StudentDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const rentalTriggerRef = useRef(null);
  const rentalSubmitGuardRef = useRef(false);
  const [rentalTarget, setRentalTarget] = useState(null);
  const pendingWishlistModelIdsRef = useRef(new Set());
  const [pendingWishlistModelIds, setPendingWishlistModelIds] = useState(
    () => new Set(),
  );
  const rentalQuery = useQuery({
    queryKey: studentRentalKeys.dashboard(),
    queryFn: ({ signal }) => getStudentRentalDashboard({ signal }),
    enabled: isMockMode,
  });
  const rentalGroups = rentalQuery.data ?? {
    approvalPending: [],
    pickupPending: [],
    renting: [],
  };
  const categoryQuery = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: ({ signal }) => fetchCategories({ signal }),
    enabled: isMockMode,
  });

  const wishlistMutation = useMutation({
    mutationFn: setEquipmentModelWishlist,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: equipmentKeys.modelLists() }),
        queryClient.invalidateQueries({ queryKey: equipmentKeys.wishlistRoot() }),
      ]);
    },
    onSettled: (_data, _error, { modelId }) => {
      pendingWishlistModelIdsRef.current.delete(modelId);
      setPendingWishlistModelIds(
        new Set(pendingWishlistModelIdsRef.current),
      );
    },
  });
  const applicationMutation = useMutation({
    mutationFn: createStudentRental,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rentalKeys.all }),
        queryClient.invalidateQueries({ queryKey: studentRentalKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["admin", "members"] }),
      ]);
      setRentalTarget(null);
    },
    onSettled: () => { rentalSubmitGuardRef.current = false; },
  });

  const handleWishChange = (modelId, isWish) => {
    if (
      !isMockMode ||
      pendingWishlistModelIdsRef.current.has(modelId)
    ) {
      return;
    }

    pendingWishlistModelIdsRef.current.add(modelId);
    setPendingWishlistModelIds(new Set(pendingWishlistModelIdsRef.current));
    wishlistMutation.mutate({ modelId, isWish });
  };
  const getCategoryLabel = (categoryId) =>
    categoryQuery.data
      ?.map((category) => toCategoryOption(category, { useMockKey: true }))
      .find((category) => String(category.categoryId) === String(categoryId))
      ?.label ?? "카테고리";
  const handleSubmitRental = (values) => {
    if (!rentalTarget || rentalSubmitGuardRef.current) return;
    rentalSubmitGuardRef.current = true;
    applicationMutation.mutate({ model: rentalTarget, user, ...values });
  };
  const navigateToRentalHistory = (status) => {
    navigate(`/student/history?status=${status}`);
  };
  const handleRentalStatusKeyDown = (event, status) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    navigateToRentalHistory(status);
  };

  const {
    items,
    loadMoreRef,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    refetch: refetchWishlist,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteScroll({
    enabled: isMockMode,
    queryKey: equipmentKeys.wishlist({ size: 12 }),
    queryFn: ({ pageParam, signal }) =>
      getMyWishlistedEquipmentModels({ page: pageParam, size: 12, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });
  const isEmptyWishlist =
    isMockMode &&
    categoryQuery.isSuccess &&
    (categoryQuery.data?.length ?? 0) > 0 &&
    isSuccess &&
    !isLoading &&
    !isError &&
    items.length === 0;
  const isEmptyRentalDashboard =
    rentalQuery.isSuccess &&
    rentalGroups.approvalPending.length === 0 &&
    rentalGroups.pickupPending.length === 0 &&
    rentalGroups.renting.length === 0;

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
        {!isMockMode ? (
          <p className={styles.noticeState}>대여 API가 아직 제공되지 않았습니다.</p>
        ) : null}
        {isMockMode && rentalQuery.isPending ? (
          <p className={styles.noticeState}>대여 현황을 불러오는 중입니다.</p>
        ) : null}
        {isMockMode && rentalQuery.isError ? (
          <div className={styles.noticeState} role="alert">
            <p>{rentalQuery.error?.message || "대여 현황을 불러오지 못했습니다."}</p>
            <IconTextButton
              icon="rotate"
              text={rentalQuery.isFetching ? "다시 시도 중" : "다시 시도"}
              disabled={rentalQuery.isFetching}
              onClick={() => rentalQuery.refetch()}
            />
          </div>
        ) : null}
        {isMockMode && isEmptyRentalDashboard ? (
          <p className={styles.noticeState}>대여 내역이 없습니다.</p>
        ) : null}
        {isMockMode && rentalQuery.isSuccess && !isEmptyRentalDashboard ? <div className={styles.rentalsGrid}>
          <div
            className={`${styles.contentArea} ${styles.rentalStatusBox}`}
            role="link"
            tabIndex={0}
            aria-label="승인대기 대여내역 보기"
            onClick={() => navigateToRentalHistory("approvalPending")}
            onKeyDown={(event) => handleRentalStatusKeyDown(event, "approvalPending")}
          >
            <StatusBadge status='대여-승인대기' size='md' />
            <ul>
              {rentalGroups.approvalPending.slice(0, 2).map((rental) => (
                <RentalsLi key={rental.rentalId} rental={rental} />
              ))}
              {rentalGroups.approvalPending.length > 2 ? <li className={styles.rentalsCount}><span>+{rentalGroups.approvalPending.length - 2}건</span></li> : ''}
            </ul>
          </div>
          <div
            className={`${styles.contentArea} ${styles.rentalStatusBox}`}
            role="link"
            tabIndex={0}
            aria-label="수령대기 대여내역 보기"
            onClick={() => navigateToRentalHistory("pickupPending")}
            onKeyDown={(event) => handleRentalStatusKeyDown(event, "pickupPending")}
          >
            <StatusBadge status='대여-수령대기' size='md' />
            <ul>
              {rentalGroups.pickupPending.slice(0, 2).map((rental) => (
                <RentalsLi key={rental.rentalId} rental={rental} />
              ))}
              {rentalGroups.pickupPending.length > 2 ? <li className={styles.rentalsCount}><span>+{rentalGroups.pickupPending.length - 2}건</span></li> : ''}
            </ul>

          </div>
          <div
            className={`${styles.contentArea} ${styles.rentalStatusBox}`}
            role="link"
            tabIndex={0}
            aria-label="대여중 대여내역 보기"
            onClick={() => navigateToRentalHistory("renting")}
            onKeyDown={(event) => handleRentalStatusKeyDown(event, "renting")}
          >
            <StatusBadge status='대여-대여중' size='md' />
            <ul>
              {rentalGroups.renting.slice(0, 2).map((rental) => (
                <RentalsLi key={rental.rentalId} rental={rental} />
              ))}
              {rentalGroups.renting.length > 2 ? <li className={styles.rentalsCount}><span>+{rentalGroups.renting.length - 2}건</span></li> : ''}
            </ul>

          </div>
        </div> : null}

      </section>

      <section className={styles.section} >
        <h3>찜목록</h3>
        <div className={styles.wishListGrid}>

          {!isMockMode ? <p>찜 API가 아직 제공되지 않았습니다.</p> : null}
          {isMockMode && categoryQuery.isPending ? <p>카테고리 정보를 불러오는 중입니다.</p> : null}
          {isMockMode && categoryQuery.isError ? (
            <div className={styles.wishlistState} role="alert">
              <p>{categoryQuery.error?.message || "카테고리 정보를 불러오지 못했습니다."}</p>
              <IconTextButton
                icon="rotate"
                text={categoryQuery.isFetching ? "다시 시도 중" : "다시 시도"}
                disabled={categoryQuery.isFetching}
                onClick={() => categoryQuery.refetch()}
              />
            </div>
          ) : null}
          {isMockMode && categoryQuery.isSuccess && categoryQuery.data.length === 0 ? (
            <p>등록된 카테고리가 없습니다.</p>
          ) : null}
          {isMockMode && categoryQuery.isSuccess && categoryQuery.data.length > 0 && isLoading ? <p>찜 목록을 불러오는 중입니다.</p> : null}
          {isMockMode && categoryQuery.isSuccess && categoryQuery.data.length > 0 && isError ? (
            <div className={styles.wishlistState} role="alert">
              <p>찜 목록을 불러오지 못했습니다.</p>
              <IconTextButton
                icon="rotate"
                text={isFetching ? "다시 시도 중" : "다시 시도"}
                disabled={isFetching}
                onClick={() => refetchWishlist()}
              />
            </div>
          ) : null}
          {isMockMode && categoryQuery.isSuccess && categoryQuery.data.length > 0 && wishlistMutation.isError ? (
            <p role="alert">찜 상태를 변경하지 못했습니다.</p>
          ) : null}
          {isEmptyWishlist ? <p>찜한 기자재가 없습니다.</p> : null}

          {isMockMode && categoryQuery.isSuccess && categoryQuery.data.length > 0 && isSuccess ? items
            .map((equipment) => (
              <EquipmentCard
                key={equipment.modelId}
                {...equipment}
                category={getCategoryLabel(equipment.categoryId)}
                isRentPending={applicationMutation.isPending && rentalTarget?.modelId === equipment.modelId}
                onRent={(event) => {
                  if (rentalSubmitGuardRef.current) return;
                  rentalTriggerRef.current = event.currentTarget;
                  applicationMutation.reset();
                  setRentalTarget({ ...equipment, category: getCategoryLabel(equipment.categoryId) });
                }}
                isWishPending={pendingWishlistModelIds.has(equipment.modelId)}
                onWishChange={(nextIsWish) =>
                  handleWishChange(equipment.modelId, nextIsWish)
                }
              />
            )) : null}

          {isMockMode && categoryQuery.isSuccess && categoryQuery.data.length > 0 ? <div ref={loadMoreRef} aria-hidden="true" /> : null}
          {isMockMode && categoryQuery.isSuccess && categoryQuery.data.length > 0 && isFetchingNextPage ? <p>찜 목록을 더 불러오는 중입니다.</p> : null}
          {isMockMode && categoryQuery.isSuccess && categoryQuery.data.length > 0 && !hasNextPage && items.length > 0 ? <p>마지막 찜 항목입니다.</p> : null}
        </div>
      </section>

      <RentalApplyModal
        isOpen={Boolean(rentalTarget)}
        equipment={rentalTarget}
        isPending={applicationMutation.isPending}
        error={applicationMutation.error}
        onClose={() => { if (!applicationMutation.isPending) setRentalTarget(null); }}
        onSubmit={handleSubmitRental}
        returnFocusRef={rentalTriggerRef}
      />

    </main>

  );
}

export default StudentDashboardPage;
