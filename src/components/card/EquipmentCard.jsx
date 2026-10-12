import styles from "./EquipmentCard.module.css"
import Button from "../common/Button";
import { WishIconButton } from "../common/IconButton";

function EquipmentCard({
    modelImageUrl,
    category = '카테고리',
    modelName = '모델명',
    specification = "",
    components = "",
    description = "",
    stockTotal = 0,
    stockRemaining = 0,
    isWish,
    isWishPending = false,
    isRentPending = false,
    onRent,
    onWishChange,
}) {
    const isStockOut = stockRemaining === 0 ? true : false;

    return (
        <div
            className={styles.equipmentCard}
            data-stockout={isStockOut}>
            <div className={styles.imageCon} data-img={Boolean(modelImageUrl)}>
                {modelImageUrl ?
                    <img src={modelImageUrl} alt={`${modelName}-image`} />
                    :
                    <img src='/icons/icon24/photo.png' alt={`no-image`} />

                }
            </div>
            <div className={styles.equipmentInfoCon}>
                <div className={styles.mainInfo}>
                    <span>{category}</span>
                    <p>{modelName}</p>
                </div>
                <div className={styles.detailInfo}>
                    <div>
                        <span>성능</span>
                        <span>{specification}</span>
                    </div>
                    <div>
                        <span>구성</span>
                        <span>{components}</span>
                    </div>
                    <div>
                        <span>설명</span>
                        <span>{description}</span>
                    </div>
                </div>
            </div>
            <div className={styles.actionCon}>

                <div className={styles.rentalInfoCon}>
                    <span>잔여 {stockRemaining}</span>
                    <span>/ 전체 {stockTotal}</span>
                </div>
                <div className={styles.buttonCon}>
                    <Button
                        color="Primary"
                        kind="border"
                        size="Default"
                        status="Default"
                        text="대여하기"
                        disabled={isStockOut || isRentPending}
                        onClick={onRent}
                    />
                    <WishIconButton
                        isWish={isWish}
                        disabled={isWishPending}
                        onClick={() => onWishChange(!isWish)}
                    />
                </div>
            </div>

        </div>
    );
}

export default EquipmentCard;
