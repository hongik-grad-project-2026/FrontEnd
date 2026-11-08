// 대여 신청 반려 모달임.
import { useId, useRef } from "react";
import BaseModal from "./BaseModal";
import Button from "../common/Button";
import Input from "../common/Input";
import styles from "./RentalRejectModal.module.css";

const REJECTION_REASON_OPTIONS = [
  {
    value: "INSUFFICIENT_STOCK",
    label: "기기 재고 부족",
  },
  {
    value: "RENTAL_SUSPENDED",
    label: "대여 중지된 기기 (기기 고장 등)",
  },
  {
    value: "OTHER",
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
  isPending = false,
  error,
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
    if (!isPending) onClose?.("cancel", event);
  };

  const handleConfirm = (event) => {
    if (!isPending) onConfirm?.(request, rejectionReason, event);
  };

  const isRejectionReasonTypeValid = REJECTION_REASON_OPTIONS.some(
    (option) => option.value === rejectionReason?.type,
  );

  const isRejectionReasonDetailValid =
    rejectionReason?.type !== "OTHER" ||
    (typeof rejectionReason.detail === "string" &&
      rejectionReason.detail.trim().length > 0);

  const isRejectionReasonValid =
    isRejectionReasonTypeValid && isRejectionReasonDetailValid;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnEscape={!isPending}
      closeOnOverlay={!isPending}
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
                <dt className={styles.infoLabel}>모델명</dt>
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

          <fieldset className={styles.reasonFieldset} disabled={isPending}>
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
                    checked={rejectionReason.type === option.value}
                    onChange={(event) =>
                      onRejectionReasonChange?.({
                        type: event.target.value,
                        detail: event.target.value === "OTHER" ? rejectionReason.detail : "",
                      })
                    }
                  />
                  <span>{option.label}</span>
                  {option.value === "OTHER" ? (
                    <Input
                      status="default"
                      width="100%"
                      height="md"
                      placeholder="반려 사유를 입력하세요"
                      helperText={
                        rejectionReason?.type === "OTHER" && !isRejectionReasonDetailValid
                          ? "반려 사유를 입력하세요"
                          : ""
                      }
                      value={rejectionReason.detail}
                      onFocus={() => onRejectionReasonChange?.({ type: "OTHER", detail: rejectionReason.detail })}
                      onChange={(event) => onRejectionReasonChange?.({ type: "OTHER", detail: event.target.value })}
                    />
                  ) : null}
                </label>
              ))}
            </div>
          </fieldset>
          {error ? <p role="alert">{error.message || "대여 신청을 반려하지 못했습니다."}</p> : null}
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
          disabled={isPending}
        />

        <Button
          className={styles.actionButton}
          kind="border"
          size="Default"
          color="Danger"
          status="Default"
          text={isPending ? "처리 중" : "신청 반려 처리"}
          type="button"
          onClick={handleConfirm}
          disabled={isPending || !isRejectionReasonValid}
        />
      </footer>
    </BaseModal>
  );
}

export default RentalRejectModal;
