import styles from "./Button.module.css";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function Button({
  className,
  color = "Neutral",
  kind = "pagination",
  showLeftIcon = false,
  size = "small",
  status = "Disabled",
  text = "Text",
  type = "button",
  disabled = false,
  ...buttonProps
}) {
  const resolvedStatus = disabled ? "Disabled" : status;
  const isDisabled = resolvedStatus === "Disabled";

  const shouldShowLeftIcon =
    showLeftIcon &&
    size === "Default" &&
    (kind === "border" || (kind === "fill" && color === "Neutral"));

  // const leftIconClassName =
  //   kind === "border" && color === "Primary"
  //     ? styles.editIcon
  //     : styles.trashIcon;
  const leftIconClassName = () => {
    if (kind === "border") {
      if (color === "Primary") { return styles.editIcon; }
      else if (color === "Neutral") { return styles.paperclipIcon; }
      else { return styles.trashIcon; }
    }
  }

  const shouldShowRightIcon =
    kind === "fill" && size === "Default" && color === "Neutral";

  return (
    <button
      {...buttonProps}
      type={type}
      className={joinClassNames(styles.button, className)}
      data-kind={kind}
      data-status={resolvedStatus}
      data-size={size}
      data-color={color}
      disabled={isDisabled}
    >
      {shouldShowLeftIcon ? (
        <span
          className={joinClassNames(styles.leftIcon, leftIconClassName())}
          aria-hidden="true"
        />
      ) : null}

      <span className={styles.label}>{text}</span>

      {shouldShowRightIcon ? (
        <span className={styles.bookmarkPlusIcon} aria-hidden="true" />
      ) : null}
    </button>
  );
}

export default Button;
