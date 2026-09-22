//개별 기자재 폐기
import { useId } from "react";

import Button from "../common/Button";
import BaseModal from "./BaseModal";

import styles from "./AssetDisposeModal.module.css";

const STATUS_LABELS = {
  available: "대여 가능",
  rented: "대여 중",
  broken: "고장",
  disposalScheduled: "폐기 예정",
};

function AssetDisposeModal({
  asset,
  isOpen = false,
  isPending = false,
  modelName,
  onClose,
  onConfirm,
  returnFocusRef,
}) {
  const generatedId = useId();

  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  if (!asset) {
    return null;
  }

  const handleRequestClose = (reason, event) => {
    if (isPending) {
      return;
    }

    onClose?.(reason, event);
  };

  const handleCancel = (event) => {
    handleRequestClose("cancel", event);
  };

  const handleConfirm = (event) => {
    if (isPending) {
      return;
    }

    onConfirm?.(
      {
        modelId: asset.modelId,
        itemId: asset.itemId,
      },
      event,
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleRequestClose}
      className={styles.modal}
      ariaLabelledBy={titleId}
      ariaDescribedBy={descriptionId}
      closeOnEscape={!isPending}
      closeOnOverlay={!isPending}
      returnFocusRef={returnFocusRef}
    >
      <section className={styles.layout}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            기기 폐기
          </h2>
        </header>

        <div className={styles.content}>
          <section className={styles.assetSection}>
            <h3 className={styles.sectionTitle}>기자재</h3>

            <strong className={styles.modelName}>
              {modelName || "개별 기자재"}
            </strong>

            <div className={styles.assetInformation}>
              <h3 className={styles.sectionTitle}>기기 정보</h3>

              <dl className={styles.informationGrid}>
                <div className={styles.informationItem}>
                  <dt>라벨 번호</dt>
                  <dd>{asset.labelNumber || "-"}</dd>
                </div>

                <div className={styles.informationItem}>
                  <dt>상태</dt>
                  <dd>{STATUS_LABELS[asset.status] ?? "-"}</dd>
                </div>

                <div className={styles.informationItem}>
                  <dt>비품 번호</dt>
                  <dd>{asset.assetNumber || "-"}</dd>
                </div>

                <div className={styles.informationItem}>
                  <dt>특이사항</dt>
                  <dd>{asset.notes || "-"}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className={styles.warningSection}>
            <p id={descriptionId} className={styles.warningText}>
              폐기 처리 후 되돌릴 수 없습니다.
            </p>

            <strong className={styles.question}>폐기 하시겠습니까?</strong>
          </section>
        </div>

        <footer className={styles.actions}>
          <Button
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
            text={isPending ? "처리 중" : "기기 폐기"}
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
          />
        </footer>
      </section>
    </BaseModal>
  );
}

export default AssetDisposeModal;
