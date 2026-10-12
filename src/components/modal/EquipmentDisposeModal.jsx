// 기자재 모델 폐기 모달임.
import { useId, useRef } from "react";
import Button from "../common/Button";
import BaseModal from "./BaseModal";
import styles from "./EquipmentDisposeModal.module.css";

const STATUS_LABELS = {
  active: "대여 진행",
  paused: "대여 중지",
};

function EquipmentDisposeModal({
  categoryLabel,
  equipment,
  isOpen = false,
  isPending = false,
  onClose,
  onConfirm,
  returnFocusRef,
}) {
  const generatedId = useId();
  const cancelButtonRef = useRef(null);

  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  if (!equipment) {
    return null;
  }

  const handleCancel = (event) => {
    if (isPending) {
      return;
    }

    onClose?.("cancel", event);
  };

  const handleConfirm = (event) => {
    if (isPending) {
      return;
    }

    onConfirm?.(equipment, event);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={isPending ? undefined : onClose}
      className={styles.modal}
      ariaLabelledBy={titleId}
      ariaDescribedBy={descriptionId}
      initialFocusRef={cancelButtonRef}
      returnFocusRef={returnFocusRef}
      closeOnEscape={!isPending}
      closeOnOverlay={!isPending}
    >
      <section className={styles.layout}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            기자재 폐기
          </h2>
        </header>

        <div className={styles.content}>
          <section className={styles.equipmentSection}>
            <strong className={styles.equipmentName}>{equipment.name}</strong>

            <div className={styles.information}>
              <h3 className={styles.sectionTitle}>기자재 정보</h3>

              <dl className={styles.informationGrid}>
                <div className={styles.informationItem}>
                  <dt>카테고리</dt>
                  <dd>{categoryLabel}</dd>
                </div>

                <div className={styles.informationItem}>
                  <dt>상태</dt>
                  <dd>{STATUS_LABELS[equipment.status] ?? "-"}</dd>
                </div>

                <div className={styles.informationItem}>
                  <dt>재고</dt>
                  <dd>{equipment.stockText}</dd>
                </div>

                <div className={styles.informationItem}>
                  <dt>폐기일</dt>
                  <dd>{equipment.disposalDate}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className={styles.warningSection}>
            <p id={descriptionId} className={styles.warningDescription}>
              폐기 처리 후 되돌릴 수 없습니다.
              <br />
              해당 모델에 속한 모든 기기 정보도 함께 폐기됩니다.
            </p>

            <strong className={styles.confirmQuestion}>
              폐기 하시겠습니까?
            </strong>
          </section>
        </div>

        <footer className={styles.actions}>
          <Button
            ref={cancelButtonRef}
            className={styles.actionButton}
            kind="border"
            size="Default"
            color="Neutral"
            status="Default"
            text="취소"
            type="button"
            disabled={isPending}
            onClick={handleCancel}
          />

          <Button
            className={styles.actionButton}
            kind="border"
            size="Default"
            color="Danger"
            status="Default"
            text={isPending ? "처리 중" : "기자재 폐기"}
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
          />
        </footer>
      </section>
    </BaseModal>
  );
}

export default EquipmentDisposeModal;
