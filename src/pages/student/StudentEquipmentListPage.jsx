import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  ALL_CATEGORY_OPTION,
  categoryKeys,
  fetchCategories,
  toCategoryOption,
} from "../../api/categories";
import { isMockMode } from "../../api/client";
import { getEquipmentModels } from "../../api/equipmentApi";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import Tabs from "../../components/common/Tabs";
import EquipmentCard from "../../components/card/EquipmentCard";
import PageHeader from "../../components/layout/PageHeader";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import styles from "./StudentEquipmentListPage.module.css";

function StudentEquipmentListPage() {
  const [selectedCategory, setSelectedCategory] = useState(
    ALL_CATEGORY_OPTION.value,
  );
  const [wishOverrides, setWishOverrides] = useState({});

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
    enabled: isMockMode && hasCategories,
    queryKey: ["equipment-models", selectedCategory],
    queryFn: ({ pageParam }) =>
      getEquipmentModels({
        page: pageParam,
        size: 12,
        categoryId: selectedCategoryId,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });

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
            disabled={!isMockMode || !hasCategories}
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
            {!isMockMode ? (
              <p className={styles.equipmentState}>
                기자재 API가 아직 제공되지 않았습니다.
              </p>
            ) : null}

            {isMockMode && isLoading ? (
              <p className={styles.equipmentState}>
                기자재 목록을 불러오는 중입니다.
              </p>
            ) : null}
            {isMockMode && isError ? (
              <p className={styles.equipmentState} role="alert">
                기자재 목록을 불러오지 못했습니다.
              </p>
            ) : null}

            {isMockMode
              ? items.map((equipment) => (
                  <EquipmentCard
                    key={equipment.id}
                    category={
                      categoryOptions.find(
                        (category) =>
                          String(category.categoryId) ===
                          String(equipment.categoryId),
                      )?.label ?? "카테고리"
                    }
                    {...equipment}
                    isWish={wishOverrides[equipment.id] ?? equipment.isWish}
                    onWishChange={(nextIsWish) =>
                      handleWishChange(equipment.id, nextIsWish)
                    }
                  />
                ))
              : null}

            {isMockMode ? (
              <div ref={loadMoreRef} aria-hidden="true" />
            ) : null}
            {isMockMode && isFetchingNextPage ? (
              <p className={styles.equipmentState}>더 불러오는 중...</p>
            ) : null}
            {isMockMode && !hasNextPage && items.length > 0 ? (
              <p className={styles.equipmentState}>마지막 기자재입니다.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default StudentEquipmentListPage;
