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
      <img src={`/icons/icon16/${icon}.png`} alt="" aria-hidden="true" />
    </button>
  );
}

export default IconButton;
