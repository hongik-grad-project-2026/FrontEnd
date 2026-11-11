import { useRef, useState } from "react";
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
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import Tabs from "../../components/common/Tabs";
import EquipmentCard from "../../components/card/EquipmentCard";
import PageHeader from "../../components/layout/PageHeader";
import RentalApplyModal from "../../components/modal/RentalApplyModal";
import { useUser } from "../../context/UserContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import styles from "./StudentEquipmentListPage.module.css";

function StudentEquipmentListPage() {
  const queryClient = useQueryClient();
  const { user } = useUser();
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

  const categoryQuery = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: ({ signal }) => fetchCategories({ signal }),
  });

  const serverCategories = categoryQuery.data ?? [];
  const categoryOptions = serverCategories.map((category) =>
    toCategoryOption(category, { useMockKey: isMockMode }),
  );
  const hasCategories = categoryQuery.isSuccess && categoryOptions.length > 0;
  const categories = [
    {
      ...ALL_CATEGORY_OPTION,
      disabled: !hasCategories,
    },
    ...categoryOptions,
  ];
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rentalKeys.all }),
        queryClient.invalidateQueries({ queryKey: studentRentalKeys.all }),
        queryClient.invalidateQueries({ queryKey: equipmentKeys.modelLists() }),
        queryClient.invalidateQueries({ queryKey: equipmentKeys.adminModelLists() }),
        queryClient.invalidateQueries({ queryKey: ["admin", "members"] }),
      ]);
      setRentalTarget(null);
    },
    onSettled: () => {
      rentalSubmitGuardRef.current = false;
    },
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
      <PageHeader />
      <div className={styles.equipmentListSection}>
        <div className={styles.toolsCon}>
          <Tabs
            items={categories}
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
            {isMockMode && wishlistMutation.isError ? (
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
                    isWishDisabled={!isMockMode}
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
    </main>
  );
}

export default StudentEquipmentListPage;
