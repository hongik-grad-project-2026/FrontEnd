import { useEffect, useId, useRef, useState } from "react";
import Button from "./Button";
import styles from "./Select.module.css";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function findSelectedIndex(options, value) {
  return options.findIndex((option) => Object.is(option.value, value));
}

function Select({
  ariaLabel,
  className = "",
  defaultValue = "",
  disabled = false,
  id,
  name,
  onChange,
  options = [],
  placeholder = "선택하세요.",
  value,
  width = 300,
}) {
  const generatedId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  const canOpen = !disabled && options.length > 0;
  const resolvedIsOpen = isOpen && canOpen;

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;
  const selectedIndex = findSelectedIndex(options, selectedValue);
  const selectedOption =
    selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const selectId = id ?? `${generatedId}-select`;
  const listboxId = `${selectId}-listbox`;

  const resolvedWidth = typeof width === "number" ? `${width}px` : width;
  const displayText = selectedOption?.label ?? placeholder;

  const getOptionButtons = () => {
    if (!listRef.current) {
      return [];
    }

    return Array.from(listRef.current.querySelectorAll('[role="option"]'));
  };

  const focusOption = (index) => {
    const optionButtons = getOptionButtons();

    if (optionButtons.length === 0) {
      return;
    }

    const normalizedIndex =
      (index + optionButtons.length) % optionButtons.length;

    optionButtons[normalizedIndex]?.focus();
  };

  const openSelect = (focusIndex) => {
    if (!canOpen) {
      return;
    }

    setIsOpen(true);

    window.requestAnimationFrame(() => {
      focusOption(focusIndex);
    });
  };

  const closeSelect = ({ restoreFocus = false } = {}) => {
    setIsOpen(false);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const handleTriggerClick = () => {
    if (resolvedIsOpen) {
      closeSelect();
      return;
    }

    openSelect(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const handleTriggerKeyDown = (event) => {
    if (!canOpen) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        openSelect(selectedIndex >= 0 ? selectedIndex : 0);
        break;

      case "ArrowUp":
        event.preventDefault();
        openSelect(selectedIndex >= 0 ? selectedIndex : options.length - 1);
        break;

      case "Escape":
        if (resolvedIsOpen) {
          event.preventDefault();
          closeSelect();
        }
        break;

      default:
        break;
    }
  };

  const selectOption = (option) => {
    const valueChanged = !Object.is(option.value, selectedValue);

    if (valueChanged) {
      if (!isControlled) {
        setInternalValue(option.value);
      }

      onChange?.(option.value, option);
    }

    closeSelect({ restoreFocus: true });
  };

  const handleOptionKeyDown = (event, optionIndex) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusOption(optionIndex + 1);
        break;

      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusOption(optionIndex - 1);
        break;

      case "Home":
        event.preventDefault();
        focusOption(0);
        break;

      case "End":
        event.preventDefault();
        focusOption(options.length - 1);
        break;

      case "Escape":
        event.preventDefault();
        closeSelect({ restoreFocus: true });
        break;

      case "Tab":
        closeSelect();
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (!resolvedIsOpen) {
      return undefined;
    }

    const handleOutsidePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [resolvedIsOpen]);

  useEffect(() => {
    if (canOpen || !isOpen) {
      return undefined;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      setIsOpen(false);
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [canOpen, isOpen]);

  const rootClassName = joinClassNames(styles.select, className);

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      style={{ width: resolvedWidth }}
      data-open={resolvedIsOpen}
      data-filled={selectedOption !== undefined}
      data-disabled={disabled}
    >
      {name ? (
        <input
          type="hidden"
          name={name}
          value={selectedOption?.value ?? ""}
          disabled={disabled}
        />
      ) : null}

      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        className={styles.trigger}
        aria-label={ariaLabel ? `${ariaLabel}: ${displayText}` : undefined}
        aria-haspopup="listbox"
        aria-expanded={resolvedIsOpen}
        aria-controls={resolvedIsOpen ? listboxId : undefined}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={selectedOption ? styles.value : styles.placeholder}>
          {displayText}
        </span>

        <span className={styles.icon} aria-hidden="true" />
      </button>

      {resolvedIsOpen ? (
        <div
          ref={listRef}
          id={listboxId}
          className={styles.optionList}
          role="listbox"
          aria-label={ariaLabel ? `${ariaLabel} 옵션` : "선택 옵션"}
          aria-orientation="horizontal"
        >
          {options.map((option, optionIndex) => {
            const isSelected = Object.is(option.value, selectedValue);

            return (
              <Button
                key={`${typeof option.value}:${String(option.value)}`}
                className={styles.option}
                color="Neutral"
                kind="border"
                size="Xsmall"
                status={isSelected ? "Active" : "Default"}
                text={option.label}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-selected={isSelected}
                tabIndex={-1}
                onClick={() => selectOption(option)}
                onKeyDown={(event) => handleOptionKeyDown(event, optionIndex)}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default Select;
