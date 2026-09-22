//개별 기자재 작업 결과
import { useId, useRef } from "react";

import Button from "../common/Button";
import BaseModal from "./BaseModal";

import styles from "./AssetResultModal.module.css";

function AssetResultModal({
  description,
  details,
  isOpen = false,
  onClose,
  returnFocusRef,
  secondaryDescription,
  title,
  variant = "success",
}) {
  const generatedId = useId();
  const confirmButtonRef = useRef(null);

  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  const isSuccess = variant === "success";
  const isNeutralWarning = variant === "neutral-warning";

  const handleClose = (event) => {
    onClose?.("confirm", event);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      ariaLabelledBy={titleId}
      ariaDescribedBy={description ? descriptionId : undefined}
      initialFocusRef={confirmButtonRef}
      returnFocusRef={returnFocusRef}
    >
      <div className={styles.content}>
        <span
          className={styles.icon}
          data-icon={isSuccess ? "checkmark" : "warning"}
          data-tone={
            isNeutralWarning ? "neutral" : isSuccess ? "primary" : "danger"
          }
          aria-hidden="true"
        />

        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>

        {details ? (
          <dl className={styles.details}>
            <div className={styles.detailRow}>
              <dt>총 수량 :</dt>
              <dd>
                <strong>{details.quantity}</strong>개
              </dd>
            </div>

            <div className={styles.detailRow}>
              <dt>라벨 :</dt>
              <dd>
                <strong>{details.labelStart}</strong>
                <span> ~ </span>
                <strong>{details.labelEnd}</strong>
              </dd>
            </div>

            <div className={styles.detailRow}>
              <dt>비품 번호 :</dt>
              <dd>
                <strong>{details.assetNumberStart}</strong>
                <span> ~ </span>
                <strong>{details.assetNumberEnd}</strong>
              </dd>
            </div>
          </dl>
        ) : null}

        {description ? (
          <div id={descriptionId} className={styles.descriptionGroup}>
            <p className={styles.description}>{description}</p>

            {secondaryDescription ? (
              <p className={styles.secondaryDescription}>
                {secondaryDescription}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={styles.actions}>
        <Button
          ref={confirmButtonRef}
          className={styles.actionButton}
          kind="border"
          size="Default"
          color={isSuccess ? "Primary" : "Danger"}
          status="Default"
          text="확인"
          type="button"
          onClick={handleClose}
        />
      </div>
    </BaseModal>
  );
}

export default AssetResultModal;
