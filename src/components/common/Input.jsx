import styles from "./Input.module.css";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function InputBar({
  status = 'default', // default | disabled
  width = 220,
  height = "md",
  placeholder = "placeholder",
  helperText,
  rightElement,
  ...props
}) {
  const resolvedWidth = typeof width === "number" ? `${width}px` : width;

  const heightClassName =
    {
      lg: styles.size48,
      md: styles.size40,
      sm: styles.size36,
    }[height] ?? styles.size40;

  return (
    <div className={styles.inputContainer}>
      <div
        className={joinClassNames(
          styles.inputBar,
          heightClassName,
          (rightElement === null || rightElement === undefined) &&
          styles.noRightElement,
        )}
        style={{ width: resolvedWidth }}
      >
        <input
          className={styles.input}
          type="text"
          placeholder={placeholder}
          disabled={status === 'disabled'}
          {...props}
        />

        {rightElement}
      </div>

      {helperText ? <p className={styles.helperText}>{helperText}</p> : ""}
    </div>
  );
}

export default InputBar;
