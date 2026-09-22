import { useEffect, useId, useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import Button from "./Button";
import styles from "./Select.module.css";

const KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function isValidDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function isSameDate(firstDate, secondDate) {
  if (!isValidDate(firstDate) || !isValidDate(secondDate)) {
    return false;
  }

  return firstDate.getTime() === secondDate.getTime();
}

function formatDate(date) {
  if (!isValidDate(date)) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function Select({
  ariaLabel,
  calendarLocale = "ko-KR",
  calendarProps = {},
  className = "",
  clearable = false,
  closeOnCalendarSelect = true,
  defaultValue = "",
  disabled = false,
  id,
  maxDate,
  minDate,
  onChange,
  options = [],
  placeholder,
  type = "list",
  value,
  width = 300,
}) {
  const generatedId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  const isCalendar = type === "calendar";
  const isControlled = value !== undefined;

  const selectedValue = isControlled ? value : internalValue;

  const selectedOption = isCalendar
    ? undefined
    : options.find((option) => option.value === selectedValue);

  const selectedDate =
    isCalendar && isValidDate(selectedValue) ? selectedValue : null;

  const isFilled = isCalendar
    ? selectedDate !== null
    : selectedOption !== undefined;

  const canOpen = !disabled && (isCalendar || options.length > 0);

  const resolvedIsOpen = isOpen && canOpen;

  const selectId = id ?? `${generatedId}-select`;

  const popupId = `${selectId}-popup`;

  const resolvedWidth = typeof width === "number" ? `${width}px` : width;

  const resolvedPlaceholder =
    placeholder ?? (isCalendar ? "날짜를 선택하세요." : "선택하세요.");

  const displayText = isCalendar
    ? formatDate(selectedDate) || resolvedPlaceholder
    : (selectedOption?.label ?? resolvedPlaceholder);

  const updateValue = (nextValue, detail) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue, detail);
  };

  const closeSelect = ({ restoreFocus = false } = {}) => {
    setIsOpen(false);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const handleTriggerClick = () => {
    if (!canOpen) {
      return;
    }

    setIsOpen((previousIsOpen) => {
      return !previousIsOpen;
    });
  };

  const handleRootKeyDown = (event) => {
    if (event.key !== "Escape" || !resolvedIsOpen) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    closeSelect({ restoreFocus: true });
  };

  const handleOptionSelect = (option) => {
    const isSelected = option.value === selectedValue;

    if (isSelected && clearable) {
      updateValue("", null);
    } else if (!isSelected) {
      updateValue(option.value, option);
    }

    closeSelect({ restoreFocus: true });
  };

  const handleCalendarChange = (nextValue, event) => {
    const nextDate = Array.isArray(nextValue) ? nextValue[0] : nextValue;

    if (!isValidDate(nextDate)) {
      return;
    }

    if (!isSameDate(nextDate, selectedDate)) {
      updateValue(nextDate, event);
    }

    if (closeOnCalendarSelect) {
      closeSelect({ restoreFocus: true });
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

  const iconClassName = joinClassNames(
    styles.icon,
    isCalendar ? styles.calendarIcon : styles.chevronIcon,
  );

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      style={{ width: resolvedWidth }}
      data-type={isCalendar ? "calendar" : "list"}
      data-open={resolvedIsOpen}
      data-filled={isFilled}
      data-disabled={disabled}
      onKeyDown={handleRootKeyDown}
    >
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        className={styles.trigger}
        aria-label={ariaLabel ? `${ariaLabel}: ${displayText}` : undefined}
        aria-haspopup={isCalendar ? "dialog" : undefined}
        aria-expanded={resolvedIsOpen}
        aria-controls={popupId}
        disabled={disabled}
        onClick={handleTriggerClick}
      >
        <span className={isFilled ? styles.value : styles.placeholder}>
          {displayText}
        </span>

        <span className={iconClassName} aria-hidden="true" />
      </button>

      <div
        className={styles.popup}
        data-open={resolvedIsOpen}
        aria-hidden={resolvedIsOpen ? undefined : true}
      >
        <div className={styles.popupContent}>
          {isCalendar ? (
            <div
              id={popupId}
              className={joinClassNames(
                // styles.popupContent,
                styles.calendarPanel,
              )}
              role="dialog"
              aria-label={ariaLabel ? `${ariaLabel} 달력` : "날짜 선택 달력"}
            >
              <Calendar
                {...calendarProps}
                className={styles.calendar}
                calendarType="gregory"
                locale={calendarLocale}
                minDate={minDate}
                maxDate={maxDate}
                minDetail="month"
                maxDetail="month"
                next2Label={null}
                prev2Label={null}
                selectRange={false}
                showFixedNumberOfWeeks
                value={selectedDate}
                formatDay={(_, date) => String(date.getDate())}
                formatMonthYear={(_, date) => `${date.getMonth() + 1}월`}
                formatShortWeekday={(_, date) => KOREAN_WEEKDAYS[date.getDay()]}
                onChange={handleCalendarChange}
              />
            </div>
          ) : (
            <div
              id={popupId}
              // className={joinClassNames(styles.popupContent, styles.optionList)}
              className={styles.optionList}
              role="group"
              aria-label={ariaLabel ? `${ariaLabel} 옵션` : "선택 옵션"}
            >
              {options.map((option) => {
                const isSelected = option.value === selectedValue;

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
                    aria-pressed={isSelected}
                    data-selected={isSelected}
                    onClick={() => handleOptionSelect(option)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Select;
