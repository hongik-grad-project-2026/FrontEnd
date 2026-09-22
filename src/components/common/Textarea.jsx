import styles from "./Textarea.module.css";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function resolveDimension(value) {
  return typeof value === "number" ? `${value}px` : value;
}

function Textarea({
  "aria-invalid": ariaInvalid,
  className = "",
  error = false,
  height = 41,
  style,
  width = 393,
  ...textareaProps
}) {
  return (
    <textarea
      {...textareaProps}
      aria-invalid={error ? true : ariaInvalid}
      className={joinClassNames(styles.textarea, className)}
      style={{
        ...style,
        width: resolveDimension(width),
        height: resolveDimension(height),
      }}
    />
  );
}

export default Textarea;
