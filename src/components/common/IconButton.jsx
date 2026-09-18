import styles from "./IconButton.module.css";

const iconButtonLabels = {
  back: "뒤로",
  "back--n50": "뒤로",
  forward: "앞으로",
  "forward--n50": "앞으로",
};

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function IconImage({ icon, size = 16 }) {
  return (
    <img
      src={`/icons/icon${size}/${icon}.png`}
      alt=""
      aria-hidden="true"
    />
  );
}

function IconButton({
  icon = "back",
  size = 24,
  ariaLabel,
  className,
  type = "button",
  ...buttonProps
}) {
  const sizeClassName = Number(size) === 32 ? styles.size32 : styles.size24;

  return (
    <button
      {...buttonProps}
      type={type}
      className={joinClassNames(styles.iconButton, sizeClassName, className)}
      aria-label={ariaLabel ?? iconButtonLabels[icon] ?? "아이콘 버튼"}
    >
      <IconImage icon={icon} />
    </button>
  );
}


function IconTextButton({
  icon = "logout",
  border = true,
  ariaLabel,
  className,
  type = "button",
  text,
  ...buttonProps
}) {

  return (
    <button
      {...buttonProps}
      type={type}
      className={joinClassNames(styles.IconTextButton, className) + (border ? ` ${styles.border}` : ` ${styles.nonBorder}`)}
      aria-label={ariaLabel ?? "아이콘 버튼"}
    >
      <IconImage icon={icon} />
      {text && <span className={styles.iconButtonText}>{text}</span>}
    </button>
  );
}


function InputIconButton({
  icon = "search",
  ariaLabel,
  className,
  type = "button",
  ...buttonProps
}) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={joinClassNames(styles.inputIconButton, className)}
      aria-label={ariaLabel ?? "아이콘 버튼"}
    >
      <IconImage icon={icon} size={24} />
    </button>
  );
}

function WishIconButton({
  ariaLabel,
  isWish = false,
  className,
  type = "button",
  ...buttonProps
}) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={joinClassNames(styles.wishIconButton, className,)}
      aria-label={ariaLabel ?? (isWish ? "찜 해제" : "찜하기")}
      aria-pressed={isWish}
    >
      <div className={styles.wishIconImg}></div>
    </button>
  )
}

export { IconTextButton, InputIconButton, WishIconButton };
export default IconButton;
