//대여 신청 반려
import { useId, useRef } from "react";
import BaseModal from "./BaseModal";
import Button from "../common/Button";
import styles from "./RentalRejectModal.module.css";

const REJECTION_REASON_OPTIONS = [
  {
    value: "out-of-stock",
    label: "기기 재고 부족",
  },
  {
    value: "equipment-unavailable",
    label: "대여 중지된 기기 (기기 고장 등)",
  },
  {
    value: "other",
    label: "기타",
  },
];

function RentalRejectModal({
  isOpen = false,
  onClose,
  onConfirm,
  rejectionReason,
  onRejectionReasonChange,
  request,
  returnFocusRef,
}) {
  const generatedId = useId();
  const firstReasonRef = useRef(null);

  if (!request) {
    return null;
  }

  const titleId = `${generatedId}-title`;
  const warningId = `${generatedId}-warning`;
  const reasonGroupName = `${generatedId}-rejection-reason`;

  const handleBack = (event) => {
    onClose?.("cancel", event);
  };

  const handleConfirm = (event) => {
    onConfirm?.(request, rejectionReason, event);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      ariaLabelledBy={titleId}
      ariaDescribedBy={warningId}
      initialFocusRef={firstReasonRef}
      returnFocusRef={returnFocusRef}
    >
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          대여 신청 반려하기
        </h2>
      </header>

      <div className={styles.body}>
        <section
          className={styles.requestSummary}
          aria-label="반려할 대여 신청 정보"
        >
          <div className={styles.requestId}>대여내역 ID : {request.id}</div>

          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>기자재 정보</h3>

            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>카테고리</dt>
                <dd className={styles.infoValue}>{request.category}</dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>기자재명</dt>
                <dd className={styles.infoValue}>{request.equipmentName}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>신청 정보</h3>

            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>대여 유형</dt>
                <dd className={styles.infoValue}>{request.rentalType}</dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>수령 희망일</dt>
                <dd className={styles.infoValue}>{request.startDate}</dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>대여 사유</dt>
                <dd className={styles.infoValue}>{request.reason}</dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>반납 예정일</dt>
                <dd className={styles.infoValue}>{request.endDate}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className={styles.rejectionSection}>
          <p id={warningId} className={styles.warning}>
            신청 반려는 되돌릴 수 없습니다.
          </p>

          <fieldset className={styles.reasonFieldset}>
            <legend className={styles.reasonTitle}>반려 사유</legend>

            <div className={styles.reasonList}>
              {REJECTION_REASON_OPTIONS.map((option, index) => (
                <label key={option.value} className={styles.reasonOption}>
                  <input
                    ref={index === 0 ? firstReasonRef : undefined}
                    className={styles.radio}
                    type="radio"
                    name={reasonGroupName}
                    value={option.value}
                    checked={rejectionReason === option.value}
                    onChange={(event) =>
                      onRejectionReasonChange?.(event.target.value)
                    }
                  />

                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>
      </div>

      <footer className={styles.actions}>
        <Button
          className={styles.actionButton}
          kind="border"
          size="Default"
          color="Neutral"
          status="Default"
          text="돌아가기"
          type="button"
          onClick={handleBack}
        />

        <Button
          className={styles.actionButton}
          kind="border"
          size="Default"
          color="Danger"
          status="Default"
          text="신청 반려 처리"
          type="button"
          onClick={handleConfirm}
        />
      </footer>
    </BaseModal>
  );
}

export default RentalRejectModal;
