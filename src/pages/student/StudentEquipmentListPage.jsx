import { useState } from "react"
import { getEquipmentModels } from "../../api/equipmentApi"
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"
import { EQUIPMENT_CATEGORIES } from "../../api/categories"
import styles from "./StudentEquipmentListPage.module.css"

import PageHeader from "../../components/layout/PageHeader"
import Tabs from "../../components/common/Tabs"
import EquipmentCard from "../../components/card/EquipmentCard"
import SearchBar from "../../components/common/SearchBar"

function StudentEquipmentListPage() {
    // 선택된 탭의 value
    const [selectedCategory, setSelectedCategory] = useState("all");

    // 찜 변경 API가 아직 연결되지 않아, 서버에서 받은 isWish를 덮어쓸 화면 내 임시 변경값만 보관
    const [wishOverrides, setWishOverrides] = useState({});

    // value는 화면과 API 응답에서 사용하는 카테고리 코드, label은 탭과 카드에 표시할 한글 이름입니다.
    const categories = EQUIPMENT_CATEGORIES.map(({ key, label, apiId }) => ({
        value: key,
        label: label,
        categoryId: apiId,
    }));

    function handleWishChange(equipmentId, nextIsWish) {
        // 기존 항목을 보존하면서 클릭한 기자재 id의 찜 상태만 덮어씁니다.
        setWishOverrides((current) => ({
            ...current,
            [equipmentId]: nextIsWish,
        }));
    }


    // 선택한 탭에 해당하는 백엔드 숫자 ID입니다. "all"일 때는 undefined가 됩니다.
    const selectedCategoryId = categories.find(category => category.value === selectedCategory)?.categoryId;

    // 무한 스크롤 훅
    const {
        items,
        loadMoreRef,
        isLoading,
        isError,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteScroll({
        // 카테고리가 달라지면 별도 캐시/조회 결과로 취급하도록 선택 카테고리를 키에 포함합니다.
        queryKey: ["equipment-models", selectedCategory],
        // pageParam은 현재 요청할 0 기반 페이지 번호입니다. 페이지당 카드 12개를 요청합니다.
        queryFn: ({ pageParam }) =>
            getEquipmentModels({ page: pageParam, size: 12, categoryId: selectedCategoryId }),
        // 첫 요청은 0페이지입니다.
        initialPageParam: 0,
        // 응답의 page와 totalPages를 비교해 다음 페이지가 있을 때만 번호를 반환합니다.
        // undefined를 반환하면 TanStack Query가 더 불러올 페이지가 없다고 판단합니다.
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
                    <SearchBar placeholder='기기명으로 검색...' />
                </div>
                <div className={styles.equipmentGrid}>

                    {isLoading ? <p>기자재 목록을 불러오는 중입니다.</p> : null}
                    {isError ? <p role="alert">기자재 목록을 불러오지 못했습니다.</p> : null}

                    {items.map((equipment) => (
                        <EquipmentCard
                            key={equipment.id}
                            category={
                                categories.find(
                                    (categoryItem) =>
                                            categoryItem.categoryId === equipment.categoryId
                                )?.label ?? "카테고리"
                            }
                            {...equipment}
                            // 사용자가 변경한 상태 우선, 없으면 서버 응답 상태를 사용
                            isWish={wishOverrides[equipment.id] ?? equipment.isWish}
                            onWishChange={(nextIsWish) =>
                                handleWishChange(equipment.id, nextIsWish)
                            }
                        />
                    ))}
                    <div ref={loadMoreRef} aria-hidden="true" />
                    {isFetchingNextPage ? <p>더 불러오는 중...</p> : null}
                    {!hasNextPage && items.length > 0 ? <p>마지막 기자재입니다.</p> : null}
                </div>
            </div>
        </main>
    );
}

export default StudentEquipmentListPage;
