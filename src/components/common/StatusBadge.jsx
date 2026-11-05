import styles from "./StatusBadge.module.css";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

const badgeKinds = {
  "대여-대여중": {
    innerText: "●  대여중",
    bgColor: "status-success",
    textColor: "status-success-dark",
  },
  "대여-연체": {
    innerText: "⚠  연체",
    bgColor: "status-danger",
    textColor: "white",
  },
  "대여-수령대기": {
    innerText: "○ 수령대기",
    bgColor: "brand-secondary",
    textColor: "brand-primary",
  },
  "대여-승인대기": {
    innerText: "··· 승인대기",
    bgColor: "status-warning",
    textColor: "status-warning-dark",
  },
  "대여-신청취소": {
    innerText: "✕  신청취소",
    bgColor: "neutral-20",
    textColor: "neutral-60",
  },
  "대여-반납완료": {
    innerText: "반납완료",
    bgColor: "white",
    textColor: "neutral-60",
  },

  "회원-일반": {
    innerText: "일반회원",
    bgColor: "white",
    textColor: "neutral-60",
  },
  "회원-블랙": {
    innerText: "블랙리스트",
    bgColor: "neutral-100",
    textColor: "white",
  },

  "기자재-대여진행": {
    innerText: "대여진행",
    bgColor: "brand-secondary",
    textColor: "brand-primary",
  },
  "기자재-대여중지": {
    innerText: "대여중지",
    bgColor: "status-danger-light",
    textColor: "status-danger",
  },

  "기기-대여가능": {
    innerText: "대여 가능",
    bgColor: "brand-secondary",
    textColor: "brand-primary",
  },
  "기기-신청됨": {
    innerText: "신청됨",
    bgColor: "status-warning",
    textColor: "status-warning-dark",
  },
  "기기-대여중": {
    innerText: "대여중",
    bgColor: "status-success-light",
    textColor: "status-success-dark",
  },
  "기기-고장": {
    innerText: "고장",
    bgColor: "status-danger-light",
    textColor: "status-danger",
  },
  "기기-대여중지": {
    innerText: "대여중지",
    bgColor: "status-danger-light",
    textColor: "status-danger",
  },
  "기기-폐기예정": {
    innerText: "폐기예정",
    bgColor: "neutral-30",
    textColor: "neutral-80",
  },
  "기기-상태미확인": {
    innerText: "상태 미확인",
    bgColor: "neutral-20",
    textColor: "neutral-60",
  },
};

function StatusBadge({ status = "대여-대여중", size = "md" }) {
  const badgeKind = badgeKinds[status];

  if (!badgeKind) {
    return null;
  }

  const sizeClassName = size === "lg" ? styles.height24 : styles.height20;

  const shouldHideBorder = status.startsWith("대여-") || status === "회원-블랙";

  return (
    <div
      className={joinClassNames(styles.badge, sizeClassName)}
      status={status}
      style={{
        backgroundColor: `var(--color-${badgeKind.bgColor})`,
        color: `var(--color-${badgeKind.textColor})`,
        border: shouldHideBorder
          ? "none"
          : `var(--border-width-default) solid var(--color-${badgeKind.textColor})`,
      }}
    >
      <span>{badgeKind.innerText}</span>
    </div>
  );
}

export default StatusBadge;
