import { useId, useRef } from "react";
import BaseModal from "./BaseModal";
import Button from "../common/Button";
import styles from "./ConfirmModal.module.css";

function hasContent(content) {
  return (
    content !== undefined &&
    content !== null &&
    content !== false &&
    content !== ""
  );
}

function ConfirmModal({
  cancelText = "취소",
  closeOnEscape = true,
  closeOnOverlay = true,
  confirmColor = "Primary",
  confirmText = "확인",
  description,
  icon = "help",
  isOpen = false,
  onClose,
  onConfirm,
  returnFocusRef,
  secondaryDescription,
  showCancel = true,
  title,
}) {
  const generatedId = useId();
  const initialFocusRef = useRef(null);

  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const secondaryDescriptionId = `${generatedId}-secondary-description`;

  const hasDescription = hasContent(description);
  const hasSecondaryDescription = hasContent(secondaryDescription);

  const describedBy =
    [
      hasDescription ? descriptionId : null,
      hasSecondaryDescription ? secondaryDescriptionId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const handleCancel = (event) => {
    onClose?.("cancel", event);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      ariaLabelledBy={titleId}
      ariaDescribedBy={describedBy}
      closeOnEscape={closeOnEscape}
      closeOnOverlay={closeOnOverlay}
      initialFocusRef={initialFocusRef}
      returnFocusRef={returnFocusRef}
    >
      <div className={styles.content}>
        <span className={styles.icon} data-icon={icon} aria-hidden="true" />

        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>

        {hasDescription || hasSecondaryDescription ? (
          <div className={styles.descriptionGroup}>
            {hasDescription ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}

            {hasSecondaryDescription ? (
              <p
                id={secondaryDescriptionId}
                className={styles.secondaryDescription}
              >
                {secondaryDescription}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={styles.actions}>
        {showCancel ? (
          <Button
            ref={initialFocusRef}
            className={styles.action}
            kind="border"
            size="Default"
            color="Neutral"
            status="Default"
            text={cancelText}
            type="button"
            showLeftIcon={false}
            onClick={handleCancel}
          />
        ) : null}

        <Button
          ref={showCancel ? undefined : initialFocusRef}
          className={styles.action}
          kind="border"
          size="Default"
          color={confirmColor}
          status="Default"
          text={confirmText}
          type="button"
          showLeftIcon={false}
          onClick={onConfirm}
        />
      </div>
    </BaseModal>
  );
}

export default ConfirmModal;
