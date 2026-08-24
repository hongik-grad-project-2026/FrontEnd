import { useEffect, useRef } from "react";
import styles from "./Checkbox.module.css";

function Checkbox({
  ariaLabel = "선택",
  checked = false,
  className = "",
  disabled = false,
  indeterminate = false,
  onChange,
  ...inputProps
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const checkboxClassName = [styles.checkbox, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={checkboxClassName} data-disabled={disabled}>
      <input
        {...inputProps}
        ref={inputRef}
        type="checkbox"
        className={styles.input}
        aria-label={ariaLabel}
        aria-checked={indeterminate ? "mixed" : checked}
        checked={checked}
        disabled={disabled}
        data-indeterminate={indeterminate}
        onChange={onChange}
      />
    </label>
  );
}

export default Checkbox;
