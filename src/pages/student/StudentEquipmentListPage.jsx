import { useRef, useState, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ALL_CATEGORY_OPTION,
  categoryKeys,
  fetchCategories,
  toCategoryOption,
} from "../../api/categories";
import { isMockMode } from "../../api/client";
import {
  equipmentKeys,
  getEquipmentModels,
  setEquipmentModelWishlist,
} from "../../api/equipmentApi";
import {
  createStudentRental,
  rentalKeys,
  studentRentalKeys,
} from "../../api/rentalApi";
import SnackRouletteModal from "../../events/snack/SnackRouletteModal";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import Tabs from "../../components/common/Tabs";
import EquipmentCard from "../../components/card/EquipmentCard";
import PageHeader from "../../components/layout/PageHeader";
import RentalApplyModal from "../../components/modal/RentalApplyModal";
import { useUser } from "../../context/UserContext";
import { SemesterContext } from "../../context/SemesterContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import styles from "./StudentEquipmentListPage.module.css";
import { MOCK_SNACK_ROULETTE } from "../../events/snack/snackEvent.js";

function isRandomSnackModel(model) {
  return model?.category?.trim() === "간식" && model?.modelName?.trim() === "랜덤";
}

function formatSemesterDate(value) {
  if (!value) return "미정";

  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");

  const dateText = `${year}년 ${month}월 ${day}일`;

  // 시간이 없는 날짜는 날짜만 표시
  if (!time) return dateText;

  const [hour, minute] = time.split(":");
  const timeText =
    Number(minute) === 0
      ? `${Number(hour)}시`
      : `${Number(hour)}시 ${Number(minute)}분`;

  return `${dateText} ${timeText}`;
}

function StudentEquipmentListPage() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { semester, rentalType, isPrePickupPeriod } = useContext(SemesterContext);

  const [selectedCategory, setSelectedCategory] = useState(
    ALL_CATEGORY_OPTION.value,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const pendingWishlistModelIdsRef = useRef(new Set());
  const [pendingWishlistModelIds, setPendingWishlistModelIds] = useState(
    () => new Set(),
  );
  const rentalTriggerRef = useRef(null);
  const rentalSubmitGuardRef = useRef(false);
  const [rentalTarget, setRentalTarget] = useState(null);
  const [snackResult, setSnackResult] = useState(null);

  const categoryQuery = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: ({ signal }) => fetchCategories({ signal }),
  });

  const serverCategories = categoryQuery.data ?? [];
  const categoryOptions = serverCategories.map((category) =>
    toCategoryOption(category, { useMockKey: isMockMode }),
  );
  const hasCategories = categoryQuery.isSuccess && categoryOptions.length > 0;
  const categories = [ALL_CATEGORY_OPTION, ...categoryOptions];
  const selectedCategoryId = categories.find(
    (category) => category.value === selectedCategory,
  )?.categoryId;

  const normalizedSearchTerm = searchTerm.trim();
  const listParams = {
    categoryId: selectedCategoryId,
    keyword: normalizedSearchTerm,
    size: 12,
  };

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

  const rentalMutation = useMutation({
    mutationFn: createStudentRental,
    onSuccess: async (result, variables) => {
      const isRandomSnack = isRandomSnackModel(variables.model);
      if (isRandomSnack) {
        setRentalTarget(null);
        setSnackResult(result);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rentalKeys.all }),
        queryClient.invalidateQueries({ queryKey: studentRentalKeys.all }),
        queryClient.invalidateQueries({ queryKey: equipmentKeys.modelLists() }),
        queryClient.invalidateQueries({ queryKey: equipmentKeys.adminModelLists() }),
        queryClient.invalidateQueries({ queryKey: ["admin", "members"] }),
      ]);
      if (!isRandomSnack) {
        setRentalTarget(null);
      }
    },
    onSettled: () => {
      rentalSubmitGuardRef.current = false;
    },
  });

  const handleWishChange = (modelId, isWish) => {
    if (
      pendingWishlistModelIdsRef.current.has(modelId)
    ) {
      return;
    }

    pendingWishlistModelIdsRef.current.add(modelId);
    setPendingWishlistModelIds(new Set(pendingWishlistModelIdsRef.current));
    wishlistMutation.mutate({ modelId, isWish });
  };

  const handleOpenRental = (equipment, category, event) => {
    if (rentalSubmitGuardRef.current || equipment.stockRemaining === 0 ||
      equipment.isRentalAvailable === false) {
      return;
    }

    rentalTriggerRef.current = event.currentTarget;
    rentalMutation.reset();
    setRentalTarget({ ...equipment, category });
  };

  const handleSubmitRental = (values) => {
    if (!rentalTarget || rentalSubmitGuardRef.current) {
      return;
    }

    rentalSubmitGuardRef.current = true;
    rentalMutation.mutate({ model: rentalTarget, user, ...values });
  };

  const {
    data,
    items,
    loadMoreRef,
    isLoading,
    isError,
    error,
    isSuccess,
    isFetching,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteScroll({
    enabled: hasCategories,
    queryKey: equipmentKeys.modelList(listParams),
    queryFn: ({ pageParam, signal }) =>
      getEquipmentModels({
        page: pageParam,
        signal,
        ...listParams,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });

  const categoryCounts = data?.pages[0]?.categoryCounts ?? {};
  const tabItems = categories.map((category) => ({
    ...category,
    disabled: category.value === ALL_CATEGORY_OPTION.value && !hasCategories,
    count: categoryCounts[String(category.categoryId ?? "all")] ??
      (categoryCounts.all !== undefined ? 0 : undefined),
  }));

  const isEmptyEquipmentResult =
    hasCategories &&
    isSuccess &&
    !isLoading &&
    !isError &&
    items.length === 0;
  const emptyEquipmentMessage = normalizedSearchTerm
    ? "검색 조건에 해당하는 기자재가 없습니다."
    : selectedCategory !== ALL_CATEGORY_OPTION.value
      ? "선택한 카테고리에 등록된 기자재가 없습니다."
      : "등록된 기자재가 없습니다.";

  return (
    <main className={styles.studentEquipmentListPage}>
      <div className={styles.headerSection}>
        <PageHeader />
        <div className={styles.semesterInfo}>
          <div className={styles.semesterInfoBox}>
            <p className={styles.semesterInfoTitle}>{semester.year}학년도 {semester.term}학기 대여 일정</p>
            <ul>
              <li className={rentalType === "regular" ? styles.today : ""}><span className={styles.infoLabel}>• 사전 신청 기간 </span>{formatSemesterDate(semester.preApplyStartDate)} ~ {formatSemesterDate(semester.preApplyEndDate)}</li>
              <li className={isPrePickupPeriod ? styles.today : ""}><span className={styles.infoLabel}>• 사전 수령 기간</span>{formatSemesterDate(semester.pickupStartDate)} ~ {formatSemesterDate(semester.pickupDeadline)}</li>
              <li className={rentalType === "always" ? styles.today : ""}><span className={styles.infoLabel}>• 상시 대여 기간 </span>{formatSemesterDate(semester.onDemandStartDate)} ~ {formatSemesterDate(semester.returnDeadline)}</li>
              <li><span className={styles.infoLabel}>• 반납 마감 일시 </span>{formatSemesterDate(semester.returnDeadline)}</li>
            </ul>
          </div>
          <div className={styles.semesterInfoBox}>
            <p className={styles.semesterInfoTitle}>기자재 대여 안내</p>
            <ul>
              <li>• <span>노트북, 태블릿</span> 카테고리에 한해 사전신청이 가능합니다.</li>
              <li>• <span>노트북, 태블릿</span> 카테고리는 상시 대여 시 3일 내에 수령해야 합니다.</li>
              <li>• <span>보조배터리, 기타</span> 카테고리는 사전 신청 및 수령 기간에 대여가 제한됩니다.</li>
              <li>• <span>보조배터리, 기타</span> 카테고리는 당일 대여만 가능하며, 다음날까지 반납해야 합니다.</li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.equipmentListSection}>
        <div className={styles.toolsCon}>
          <Tabs
            items={tabItems}
            value={selectedCategory}
            onChange={setSelectedCategory}
            ariaLabel="기자재 카테고리"
          />
          <SearchBar
            placeholder="기기명으로 검색..."
            disabled={!hasCategories}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onSubmit={setSearchTerm}
          />
        </div>

        {categoryQuery.isPending ? (
          <p className={styles.categoryState}>카테고리를 불러오는 중입니다.</p>
        ) : null}

        {categoryQuery.isError ? (
          <div className={styles.categoryState} role="alert">
            <p>
              {categoryQuery.error?.message ||
                "카테고리를 불러오지 못했습니다."}
            </p>
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
          <div className={styles.equipmentGrid}>
            {isLoading ? (
              <p className={styles.equipmentState}>
                기자재 목록을 불러오는 중입니다.
              </p>
            ) : null}
            {isError ? (
              <p className={styles.equipmentState} role="alert">
                {error?.message || "기자재 목록을 불러오지 못했습니다."}
                <Button
                  kind="border"
                  size="Default"
                  color="Primary"
                  status="Default"
                  text={isFetching ? "다시 시도 중" : "다시 시도"}
                  type="button"
                  disabled={isFetching}
                  onClick={() => refetch()}
                />
              </p>
            ) : null}
            {wishlistMutation.isError ? (
              <p className={styles.equipmentState} role="alert">
                찜 상태를 변경하지 못했습니다.
              </p>
            ) : null}
            {isEmptyEquipmentResult ? (
              <p className={styles.equipmentState}>{emptyEquipmentMessage}</p>
            ) : null}

            {items.map((equipment) => {
              const categoryLabel =
                categoryOptions.find(
                  (category) =>
                    String(category.categoryId) ===
                    String(equipment.categoryId),
                )?.label ?? equipment.categoryName ?? "카테고리";

              return (
                <EquipmentCard
                  key={equipment.modelId}
                  category={categoryLabel}
                  {...equipment}
                  isRentPending={rentalMutation.isPending}
                  onRent={(event) =>
                    handleOpenRental(equipment, categoryLabel, event)
                  }
                  isWishPending={
                    pendingWishlistModelIds.has(equipment.modelId)
                  }
                  onWishChange={(nextIsWish) =>
                    handleWishChange(equipment.modelId, nextIsWish)
                  }
                />
              );
            })}

            <div ref={loadMoreRef} aria-hidden="true" />
            {isFetchingNextPage ? (
              <p className={styles.equipmentState}>더 불러오는 중...</p>
            ) : null}
            {!hasNextPage && items.length > 0 ? (
              <p className={styles.equipmentState}>마지막 기자재입니다.</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <RentalApplyModal
        isOpen={Boolean(rentalTarget)}
        equipment={rentalTarget}
        isPending={rentalMutation.isPending}
        error={rentalMutation.error}
        onClose={() => {
          if (!rentalMutation.isPending && !rentalSubmitGuardRef.current) {
            setRentalTarget(null);
          }
        }}
        onSubmit={handleSubmitRental}
        returnFocusRef={rentalTriggerRef}
      />

      <SnackRouletteModal
        isOpen={Boolean(snackResult)}
        prizes={MOCK_SNACK_ROULETTE.prizes}
        resultId={MOCK_SNACK_ROULETTE.resultId}
        outcome={snackResult}
        autoStart
        onClose={() => setSnackResult(null)}
        returnFocusRef={rentalTriggerRef}
      />
    </main >
  );
}

export default StudentEquipmentListPage;
