import { useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getStudentRentalDetail,
  studentRentalCancelReasons,
  studentRentalKeys,
} from "../../api/rentalApi";
import Button from "../common/Button";
import { InputIconButton } from "../common/IconButton";
import StatusBadge from "../common/StatusBadge";
import BaseModal from "./BaseModal";
import detailStyles from "./RentalDetailModal.module.css";
import styles from "./StudentRentalModal.module.css";

function resolveValue(value) {
  return value === undefined || value === null || value === "" ? "-" : value;
}

function ModalInfoCell({ label, value }) {
  return (
    <div className={detailStyles.infoCell}>
      <dt className={detailStyles.infoLabel}>{label}</dt>
      <dd className={detailStyles.infoValue}>{resolveValue(value)}</dd>
    </div>
  );
}

function InfoSection({ children, title }) {
  return (
    <section className={detailStyles.infoSection}>
      <h3 className={detailStyles.sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

function StudentRentalCancelModal({
  error,
  isOpen = false,
  isPending = false,
  onBack,
  onClose,
  onSubmit,
  rentalId,
  returnFocusRef,
}) {
  const generatedId = useId();
  const closeButtonRef = useRef(null);
  const submitGuardRef = useRef(false);
  const [reason, setReason] = useState("");
  const titleId = `${generatedId}-title`;

  const detailQuery = useQuery({
    queryKey: studentRentalKeys.detail(rentalId),
    queryFn: ({ signal }) => getStudentRentalDetail(rentalId, { signal }),
    enabled: isOpen && Boolean(rentalId),
    retry: (failureCount, queryError) =>
      queryError?.code !== "STUDENT_RENTAL_NOT_FOUND" && failureCount < 1,
    staleTime: 1000 * 60 * 5,
  });

  const rental = detailQuery.data;

  const handleRequestClose = (closeReason, event) => {
    if (isPending || submitGuardRef.current) {
      return;
    }

    onClose?.(closeReason, event);
  };

  const handleBack = () => {
    if (isPending || submitGuardRef.current) {
      return;
    }

    onBack?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reason || isPending || submitGuardRef.current) {
      return;
    }

    submitGuardRef.current = true;

    try {
      await onSubmit?.(reason);
    } catch {
      // 오류 문구와 선택한 사유를 현재 모달에 그대로 유지함.
    } finally {
      submitGuardRef.current = false;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleRequestClose}
      closeOnEscape={!isPending}
      closeOnOverlay={!isPending}
      className={`${detailStyles.modal} ${styles.cancelModal}`}
      ariaLabelledBy={titleId}
      initialFocusRef={closeButtonRef}
      returnFocusRef={returnFocusRef}
    >
      <form
        className={`${detailStyles.layout} ${styles.modalLayout}`}
        onSubmit={handleSubmit}
      >
        <header className={detailStyles.header}>
          <h2 id={titleId} className={detailStyles.title}>
            대여 신청 취소하기
          </h2>

          <InputIconButton
            ref={closeButtonRef}
            className={detailStyles.closeButton}
            icon="close"
            type="button"
            ariaLabel="대여 신청 취소 닫기"
            disabled={isPending}
            onClick={(event) => handleRequestClose("close-button", event)}
          />
        </header>

        {detailQuery.isPending ? (
          <div className={styles.modalState}>대여내역을 불러오는 중입니다.</div>
        ) : null}

        {detailQuery.isError ? (
          <div className={styles.modalState} role="alert">
            <p>
              {detailQuery.error?.code === "STUDENT_RENTAL_NOT_FOUND"
                ? "존재하지 않는 대여내역입니다."
                : detailQuery.error?.message ||
                "대여내역을 불러오지 못했습니다."}
            </p>
            {detailQuery.error?.code !== "STUDENT_RENTAL_NOT_FOUND" ? (
              <Button
                kind="border"
                size="Default"
                color="Primary"
                status="Default"
                text={detailQuery.isFetching ? "다시 시도 중" : "다시 시도"}
                type="button"
                disabled={detailQuery.isFetching}
                onClick={() => detailQuery.refetch()}
              />
            ) : null}
          </div>
        ) : null}

        {rental ? (
          <>
            <div className={`${detailStyles.content} ${styles.modalContent}`}>
              <section className={detailStyles.summarySection}>
                <strong className={detailStyles.rentalId}>
                  대여내역 ID : {rental.rentalId}
                </strong>
                <StatusBadge status="대여-승인대기" size="lg" />
              </section>

              <InfoSection title="기자재 정보">
                <dl className={detailStyles.infoGrid}>
                  <ModalInfoCell label="카테고리" value={rental.category} />
                  <ModalInfoCell
                    label="모델명"
                    value={rental.equipmentName}
                  />
                  <ModalInfoCell label="설명" value={rental.description} />
                  <ModalInfoCell label="구성" value={rental.components} />
                </dl>
              </InfoSection>

              <InfoSection title="신청 정보">
                <dl className={detailStyles.infoGrid}>
                  <ModalInfoCell label="대여 유형" value={rental.rentalType} />
                  <ModalInfoCell label="신청일" value={rental.requestedAt} />
                  <ModalInfoCell
                    label="수령 희망일"
                    value={rental.expectedPickupAt}
                  />
                  <ModalInfoCell
                    label="반납 예정일"
                    value={rental.expectedReturnAt}
                  />
                  <div className={`${detailStyles.infoCell} ${detailStyles.fullWidthCell}`}>
                    <dt className={detailStyles.infoLabel}>대여 사유</dt>
                    <dd className={detailStyles.infoValue}>{rental.reason}</dd>
                  </div>
                </dl>
              </InfoSection>

              <section className={styles.cancelSection}>
                <p className={styles.warningText}>
                  신청 취소는 되돌릴 수 없습니다.
                </p>

                <fieldset className={styles.reasonGroup} disabled={isPending}>
                  <legend>신청 취소 사유</legend>
                  {studentRentalCancelReasons.map((cancelReason) => (
                    <label key={cancelReason} className={styles.reasonOption}>
                      <input
                        type="radio"
                        name="cancelReason"
                        value={cancelReason}
                        checked={reason === cancelReason}
                        onChange={(event) => setReason(event.target.value)}
                      />
                      <span>{cancelReason}</span>
                    </label>
                  ))}
                </fieldset>

                {error ? (
                  <p className={styles.errorMessage} role="alert">
                    {error.message || "대여 신청을 취소하지 못했습니다."}
                  </p>
                ) : null}
              </section>
            </div>

            <footer className={detailStyles.actions}>
              <Button
                className={detailStyles.actionButton}
                kind="border"
                size="Default"
                color="Neutral"
                status="Default"
                text="돌아가기"
                type="button"
                disabled={isPending}
                onClick={handleBack}
              />
              <Button
                className={detailStyles.actionButton}
                kind="border"
                size="Default"
                color="Danger"
                status="Default"
                text={isPending ? "취소 처리 중" : "신청 취소 완료"}
                type="submit"
                disabled={!reason || isPending || detailQuery.isPending}
              />
            </footer>
          </>
        ) : null}
      </form>
    </BaseModal>
  );
}

export default StudentRentalCancelModal;
