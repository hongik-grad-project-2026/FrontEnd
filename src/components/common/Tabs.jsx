import { useId, useRef, useState } from "react";
import styles from "./Tabs.module.css";

function getFirstEnabledValue(items) {
  return items.find((item) => !item.disabled)?.value;
}

function formatCount(count) {
  return typeof count === "number" && count > 999 ? "999+" : count;
}

function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  ariaLabel = "탭 메뉴",
  className = "",
}) {
  const generatedId = useId();
  const tabRefs = useRef(new Map());

  const [internalValue, setInternalValue] = useState(
    defaultValue ?? getFirstEnabledValue(items),
  );

  const isControlled = value !== undefined;

  const selectedValue = isControlled
    ? value
    : (internalValue ?? getFirstEnabledValue(items));

  const selectItem = (item) => {
    if (item.disabled || item.value === selectedValue) {
      return;
    }

    if (!isControlled) {
      setInternalValue(item.value);
    }

    onChange?.(item.value, item);
  };

  const handleKeyDown = (event, currentItem) => {
    const enabledItems = items.filter((item) => !item.disabled);

    const currentIndex = enabledItems.findIndex(
      (item) => item.value === currentItem.value,
    );

    if (currentIndex === -1) {
      return;
    }

    let nextIndex;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % enabledItems.length;
        break;

      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + enabledItems.length) % enabledItems.length;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = enabledItems.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    const nextItem = enabledItems[nextIndex];

    selectItem(nextItem);
    tabRefs.current.get(nextItem.value)?.focus();
  };

  const rootClassName = [styles.tabs, className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName} role="tablist" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isActive = item.value === selectedValue;

        const showCount = item.count !== undefined && item.count !== null;

        const tabClassName = [styles.tab, isActive ? styles.tabActive : ""]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={item.value}
            ref={(node) => {
              if (node) {
                tabRefs.current.set(item.value, node);
              } else {
                tabRefs.current.delete(item.value);
              }
            }}
            id={`${generatedId}-tab-${index}`}
            type="button"
            role="tab"
            className={tabClassName}
            aria-selected={isActive}
            aria-controls={item.controlsId}
            tabIndex={isActive ? 0 : -1}
            disabled={item.disabled}
            onClick={() => selectItem(item)}
            onKeyDown={(event) => handleKeyDown(event, item)}
          >
            <span>{item.label}</span>

            {showCount && (
              <span className={styles.count}>({formatCount(item.count)})</span>
            )}

            {item.badge && <span className={styles.badge}>{item.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
