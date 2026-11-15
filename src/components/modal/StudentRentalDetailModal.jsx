import { useId, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getStudentRentalDetail,
  studentRentalKeys,
} from "../../api/rentalApi";
import Button from "../common/Button";
import { InputIconButton } from "../common/IconButton";
import StatusBadge from "../common/StatusBadge";
import BaseModal from "./BaseModal";
import detailStyles from "./RentalDetailModal.module.css";
import styles from "./StudentRentalModal.module.css";
import { getRentalStatus } from "../../constants/status.js";

const REJECT_REASON_LABELS = Object.freeze({
  INSUFFICIENT_STOCK: "기기 재고 부족",
  RENTAL_SUSPENDED: "대여 중지된 기기 (기기 고장 등)",
  OTHER: "기타",
});

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function resolveValue(value) {
  return value === undefined || value === null || value === "" ? "-" : value;
}

function hasResourceUrl(resourceUrl) {
  return typeof resourceUrl === "string" && resourceUrl.trim() !== "";
}

function openResourceInNewTab(resourceUrl) {
  if (!hasResourceUrl(resourceUrl)) {
    return;
  }

  window.open(resourceUrl, "_blank", "noopener,noreferrer");
}

function ModalInfoCell({ className, danger = false, label, value }) {
  return (
    <div className={joinClassNames(detailStyles.infoCell, className)}>
      <dt className={detailStyles.infoLabel}>{label}</dt>
      <dd
        className={joinClassNames(
          detailStyles.infoValue,
          danger ? detailStyles.dangerValue : "",
        )}
      >
        {resolveValue(value)}
      </dd>
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

function shouldRetry(failureCount, error) {
  return (
    error?.code !== "STUDENT_RENTAL_API_UNAVAILABLE" &&
    error?.code !== "STUDENT_RENTAL_NOT_FOUND" &&
    failureCount < 1
  );
}

function StudentRentalDetailModal({
  isOpen = false,
  onClose,
  onRequestCancel,
  rentalId,
  returnFocusRef,
}) {
  const generatedId = useId();
  const closeButtonRef = useRef(null);
  const titleId = `${generatedId}-title`;

  const detailQuery = useQuery({
    queryKey: studentRentalKeys.detail(rentalId),
    queryFn: ({ signal }) => getStudentRentalDetail(rentalId, { signal }),
    enabled: isOpen && Boolean(rentalId),
    retry: shouldRetry,
    staleTime: 1000 * 60 * 5,
  });

  const rental = detailQuery.data;
  const isApprovalPending = rental?.status === "pendingApproval";
  const isPickupPending = rental?.status === "readyForPickup";
  const isRenting = rental?.status === "renting";
  const isOverdue = rental?.status === "overdue";
  const isCanceled = rental?.status === "canceled";
  const isNoShow = rental?.status === "noShow";
  const isRejected = rental?.status === "rejected";
  const isReturned = rental?.status === "returned";
  const showApprovedInfo =
    isPickupPending || isRenting || isOverdue || isReturned;
  const showRentalInfo = showApprovedInfo || isCanceled || isNoShow || isRejected;
  const showMediaActions = isRenting || isOverdue || isReturned;
  const hasCheckoutPhoto = hasResourceUrl(rental?.checkoutPhotoUrl);
  const hasReturnPhoto = hasResourceUrl(rental?.returnPhotoUrl);
  const hasPledge = hasResourceUrl(rental?.pledgeUrl);
  const statusData = getRentalStatus(rental?.status);
  const rejectReason =
    rental?.rejectReasonType === "OTHER"
      ? rental.rejectReasonDetail
      : REJECT_REASON_LABELS[rental?.rejectReasonType] ??
      rental?.rejectReasonDetail;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className={detailStyles.modal}
      ariaLabelledBy={titleId}
      initialFocusRef={closeButtonRef}
      returnFocusRef={returnFocusRef}
    >
      <div className={`${detailStyles.layout} ${styles.modalLayout}`}>
        <header className={detailStyles.header}>
          <h2 id={titleId} className={detailStyles.title}>
            대여내역 상세
          </h2>

          <InputIconButton
            ref={closeButtonRef}
            className={detailStyles.closeButton}
            icon="close"
            type="button"
            ariaLabel="대여내역 상세 닫기"
            onClick={(event) => onClose?.("close-button", event)}
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
                <StatusBadge text={statusData.label} color={statusData.color} size="lg" />
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
                    danger={isOverdue}
                    label="반납 예정일"
                    value={rental.expectedReturnAt}
                  />
                  <ModalInfoCell
                    className={detailStyles.fullWidthCell}
                    label="대여 사유"
                    value={rental.reason}
                  />
                </dl>
              </InfoSection>

              {showRentalInfo ? (
                <InfoSection title="대여 정보">
                  <dl className={detailStyles.infoGrid}>
                    {showApprovedInfo ? (
                      <>
                        <ModalInfoCell label="승인일" value={rental.approvedAt} />
                        <ModalInfoCell
                          label="라벨번호"
                          value={rental.assetNumber}
                        />
                      </>
                    ) : null}

                    {isRenting || isOverdue || isReturned ? (
                      <ModalInfoCell
                        label="수령일"
                        value={rental.actualPickupAt}
                      />
                    ) : null}

                    {isReturned ? (
                      <ModalInfoCell
                        label="반납일"
                        value={rental.actualReturnAt}
                      />
                    ) : null}

                    {isCanceled ? (
                      <>
                        <ModalInfoCell
                          label="신청 취소일"
                          value={rental.canceledAt}
                        />
                        <ModalInfoCell
                          label="취소 사유"
                          value={rental.cancelReason}
                        />
                      </>
                    ) : null}
                    {isRejected ? (
                      <>
                        <ModalInfoCell
                          label="반려일"
                          value={rental.rejectedAt}
                        />
                        <ModalInfoCell
                          label="반려 사유"
                          value={rejectReason}
                        />
                      </>
                    ) : null}
                    {isNoShow ? (
                      <ModalInfoCell
                        label="취소 사유"
                        value="미수령"
                      />
                    ) : null}
                  </dl>
                </InfoSection>
              ) : null}
            </div>

            {isApprovalPending ? (
              <footer className={detailStyles.actions}>
                <Button
                  className={detailStyles.actionButton}
                  kind="border"
                  size="Default"
                  color="Danger"
                  status="Default"
                  text="대여 신청 취소하기"
                  type="button"
                  disabled={!onRequestCancel}
                  title={!onRequestCancel ? "신청 취소는 다음 단계에서 연결됩니다." : undefined}
                  onClick={() => onRequestCancel?.(rental)}
                />
              </footer>
            ) : null}

            {showMediaActions ? (
              <footer
                className={joinClassNames(
                  detailStyles.actions,
                  isReturned ? detailStyles.threeActions : "",
                )}
              >
                <Button
                  className={detailStyles.actionButton}
                  kind="border"
                  size="Default"
                  color="Neutral"
                  status="Default"
                  text="대여 시 사진 보기"
                  type="button"
                  disabled={!hasCheckoutPhoto}
                  onClick={() =>
                    openResourceInNewTab(rental.checkoutPhotoUrl)
                  }
                  title={
                    hasCheckoutPhoto
                      ? undefined
                      : "대여 시 사진 자료가 없습니다."
                  }
                />

                {isReturned ? (
                  <Button
                    className={detailStyles.actionButton}
                    kind="border"
                    size="Default"
                    color="Neutral"
                    status="Default"
                    text="반납 시 사진 보기"
                    type="button"
                    disabled={!hasReturnPhoto}
                    onClick={() =>
                      openResourceInNewTab(rental.returnPhotoUrl)
                    }
                    title={
                      hasReturnPhoto
                        ? undefined
                        : "반납 시 사진 자료가 없습니다."
                    }
                  />
                ) : null}

                <Button
                  className={detailStyles.actionButton}
                  kind="border"
                  size="Default"
                  color="Neutral"
                  status="Default"
                  text="서약서 내용 보기"
                  type="button"
                  disabled={!hasPledge}
                  onClick={() => openResourceInNewTab(rental.pledgeUrl)}
                  title={hasPledge ? undefined : "서약서 자료가 없습니다."}
                />
              </footer>
            ) : null}
          </>
        ) : null}
      </div>
    </BaseModal>
  );
}

export default StudentRentalDetailModal;
