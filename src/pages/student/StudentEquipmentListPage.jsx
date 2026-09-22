import { useState } from "react"
import { getEquipmentList } from "../../api/equipmentApi"
import styles from "./StudentEquipmentListPage.module.css"

import PageHeader from "../../components/layout/PageHeader"
import Tabs from "../../components/common/Tabs"
import EquipmentCard from "../../components/card/EquipmentCard"
import SearchBar from "../../components/common/SearchBar"
function StudentEquipmentListPage() {

    const [equipmentList, setEquipmentList] = useState(() => getEquipmentList())

    const [selectedCategory, setSelectedCategory] = useState("all");

    const categories = [
        { value: "all", label: "전체" },
        { value: "laptop", label: "노트북" },
        { value: "tablet", label: "태블릿" },
        { value: "keyboard", label: "키보드/마우스" },
        { value: "battery", label: "보조배터리" },
        { value: "stand", label: "노트북 거치대" },
        { value: "desk", label: "독서대" },
    ];

    const filteredEquipment =
        selectedCategory === "all"
            ? equipmentList
            : equipmentList.filter(
                (equipment) => equipment.categoryId === selectedCategory
            );


    function handleWishChange(equipmentId, nextIsWish) {
        setEquipmentList((currentList) =>
            currentList.map((equipment) =>
                equipment.id === equipmentId
                    ? { ...equipment, isWish: nextIsWish }
                    : equipment
            )
        )
    }

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

                    {filteredEquipment.map((equipment) => (
                        <EquipmentCard
                            key={equipment.id}
                            category={
                                categories.find(
                                    (categoryItem) =>
                                        categoryItem.value === equipment.categoryId
                                )?.label ?? "카테고리"
                            }
                            {...equipment}
                            onWishChange={(nextIsWish) =>
                                handleWishChange(equipment.id, nextIsWish)
                            }
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

export default StudentEquipmentListPage;
