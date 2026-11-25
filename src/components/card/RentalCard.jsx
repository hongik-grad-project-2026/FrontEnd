// AdminRentalStatusPage에서 사용하는 카드 컴포넌트임.
import styles from "./RentalCard.module.css";

function RentalCard({
  imageSrc,
  imageAlt = "",
  badge,
  children,
  actions,
  ariaLabel = "대여 카드",
}) {
  return (
    <article className={styles.card} aria-label={ariaLabel}>
      <div className={styles.imageBox}>
        {imageSrc ? (
          <img
            className={styles.equipmentImage}
            src={imageSrc}
            alt={imageAlt}
          />
        ) : (
          <img
            className={styles.placeholderIcon}
            src="/icons/icon24/photo.png"
            alt=""
            aria-hidden="true"
          />
        )}
      </div>

      {/*
        내부 텍스트 공통 컴포넌트는 부모 페이지에서 children으로 전달함.
      */}
      <div className={styles.contentSlot}>{children}</div>

      {/*
        공통 Button 컴포넌트는 부모 페이지에서 구성해 actions prop으로 전달함.
      */}
      {actions ? <div className={styles.actions}>{actions}</div> : null}

      {/*
        공통 StatusBadge 컴포넌트는 부모 페이지에서 badge prop으로 전달함.
        RentalCard는 위치만 담당하며 배지 색상·크기·텍스트는 StatusBadge가 담당함.
      */}
      {badge ? <div className={styles.badgeSlot}>{badge}</div> : null}
    </article>
  );
}

export default RentalCard;
