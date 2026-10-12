//대여 상세 및 일부 처리
import { useId, useRef, useState } from "react";
import Button from "../common/Button";
import IconButton, {
  IconTextButton,
  InputIconButton,
} from "../common/IconButton";
import InputBar from "../common/Input";
import StatusBadge from "../common/StatusBadge";
import BaseModal from "./BaseModal";
import styles from "./RentalDetailModal.module.css";

const BADGE_STATUS = {
  waiting: "대여-수령대기",
  renting: "대여-대여중",
  overdue: "대여-연체",
};

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function resolveValue(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return value;
}

function formatFileSize(size) {
  if (!Number.isFinite(size) || size < 0) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  const kilobytes = size / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function ModalInfoCell({ className, danger = false, label, value }) {
  return (
    <div className={joinClassNames(styles.infoCell, className)}>
      <dt className={styles.infoLabel}>{label}</dt>

      <dd
        className={joinClassNames(
          styles.infoValue,
          danger ? styles.dangerValue : "",
        )}
      >
        {resolveValue(value)}
      </dd>
    </div>
  );
}

function InfoSection({ children, title }) {
  return (
    <section className={styles.infoSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

function RentalDetailModal({
  initialMode = "detail",
  isOpen = false,
  onClose,
  onComplete,
  rental,
  returnFocusRef,
  workerName = "",
  isPending = false,
  error,
}) {
  const generatedId = useId();
  const closeButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState(initialMode);
  const [processPhoto, setProcessPhoto] = useState(null);

  if (!rental) {
    return null;
  }

  const titleId = `${generatedId}-title`;
  const processPhotoId = `${generatedId}-process-photo`;

  const isWaiting = rental.status === "waiting";
  const isOverdue = rental.status === "overdue";
  const isProcessing = mode === "process";

  const processType = isWaiting ? "pickup" : "return";
  const processTitle = isWaiting ? "수령" : "반납";
  const completeButtonText = `${processTitle} 처리 완료`;

  const resetProcessPhoto = () => {
    setProcessPhoto(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRequestClose = (reason, event) => {
    if (isPending) return;
    resetProcessPhoto();
    onClose?.(reason, event);
  };

  const handleStartProcess = () => {
    setMode("process");
  };

  const handleBackToDetail = () => {
    if (isPending) return;
    resetProcessPhoto();
    setMode("detail");
  };

  const handleFileSelect = (event) => {
    if (isPending) return;
    const [selectedFile] = Array.from(event.target.files ?? []);

    setProcessPhoto(selectedFile ?? null);
  };

  const handleRemoveFile = () => {
    if (isPending) return;
    resetProcessPhoto();
  };

  const handleComplete = (event) => {
    if (!processPhoto || isPending) {
      return;
    }

    onComplete?.(
      {
        processPhoto,
        processType,
        rental,
        workerName,
      },
      event,
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleRequestClose}
      closeOnEscape={!isPending}
      closeOnOverlay={!isPending}
      className={styles.modal}
      ariaLabelledBy={titleId}
      initialFocusRef={closeButtonRef}
      returnFocusRef={returnFocusRef}
    >
      <div className={styles.layout} data-mode={mode}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            대여내역 상세
          </h2>

          <InputIconButton
            ref={closeButtonRef}
            className={styles.closeButton}
            icon="close"
            type="button"
            ariaLabel="대여내역 상세 닫기"
            onClick={(event) => handleRequestClose("close-button", event)}
            disabled={isPending}
          />
        </header>

        <div className={styles.content}>
          <section className={styles.summarySection}>
            <strong className={styles.rentalId}>
              대여내역 ID : {rental.rentalId}
            </strong>

            <StatusBadge status={BADGE_STATUS[rental.status]} size="lg" />
          </section>

          <InfoSection title="학생 정보">
            <dl className={styles.infoGrid}>
              <ModalInfoCell label="이름" value={rental.studentName} />
              <ModalInfoCell label="이메일" value={rental.studentEmail} />
              <ModalInfoCell label="학번" value={rental.studentId} />
              <ModalInfoCell label="연락처" value={rental.studentPhone} />
              <ModalInfoCell label="학과" value={rental.department} />
            </dl>
          </InfoSection>

          <InfoSection title="기자재 정보">
            <dl className={styles.infoGrid}>
              <ModalInfoCell label="카테고리" value={rental.category} />
              <ModalInfoCell label="기자재명" value={rental.equipmentName} />
              <ModalInfoCell label="설명" value={rental.description} />
              <ModalInfoCell label="구성" value={rental.accessories} />
            </dl>
          </InfoSection>

          <InfoSection title="신청 정보">
            <dl className={styles.infoGrid}>
              <ModalInfoCell label="대여 유형" value={rental.rentalType} />
              <ModalInfoCell label="신청일" value={rental.requestedAt} />
              <ModalInfoCell
                label="수령 예정일"
                value={rental.expectedPickupAt}
              />
              <ModalInfoCell
                danger={isOverdue}
                label="반납 예정일"
                value={rental.expectedReturnAt}
              />
              <ModalInfoCell
                className={styles.fullWidthCell}
                label="대여 사유"
                value={rental.reason}
              />
            </dl>
          </InfoSection>

          <InfoSection title="대여 정보">
            <dl className={styles.infoGrid}>
              <ModalInfoCell label="승인일" value={rental.approvedAt} />
              <ModalInfoCell label="비품번호" value={rental.assetNumber} />

              {!isWaiting ? (
                <ModalInfoCell label="수령일" value={rental.actualPickupAt} />
              ) : null}
            </dl>
          </InfoSection>

          {isProcessing ? (
            <section className={styles.processSection}>
              <div className={styles.processField}>
                <label className={styles.processLabel}>
                  {processTitle} 처리 근로생
                </label>

                <InputBar
                  width={300}
                  height="sm"
                  status="disabled"
                  value={workerName}
                  aria-label={`${processTitle} 처리 근로생`}
                />
              </div>

              <div className={styles.processField}>
                <label className={styles.processLabel} htmlFor={processPhotoId}>
                  {processTitle} 사진 첨부
                </label>

                <input
                  ref={fileInputRef}
                  id={processPhotoId}
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isPending}
                />

                {processPhoto ? (
                  <div className={styles.fileItem}>
                    <span className={styles.fileName} title={processPhoto.name}>
                      {processPhoto.name}
                    </span>

                    <span className={styles.fileSize}>
                      {formatFileSize(processPhoto.size)}
                    </span>

                    <IconButton
                      icon="trash"
                      size={24}
                      type="button"
                      ariaLabel={`${processPhoto.name} 파일 제거`}
                      onClick={handleRemoveFile}
                      disabled={isPending}
                    />
                  </div>
                ) : (
                  <IconTextButton
                    className={styles.fileSelectButton}
                    icon="paperclip"
                    border
                    type="button"
                    text="파일 선택"
                    ariaLabel={`${processTitle} 사진 선택`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                  />
                )}
              </div>
            </section>
          ) : null}
          {error ? <p role="alert">{error.message || `${processTitle} 처리에 실패했습니다.`}</p> : null}
        </div>

        {isProcessing ? (
          <footer className={styles.actions}>
            <Button
              className={styles.actionButton}
              kind="border"
              size="Default"
              color="Neutral"
              status="Default"
              text="돌아가기"
              type="button"
              onClick={handleBackToDetail}
              disabled={isPending}
            />

            <Button
              className={styles.actionButton}
              kind="fill"
              size="Default"
              color="Primary"
              status="Default"
              text={isPending ? "처리 중" : completeButtonText}
              type="button"
              disabled={!processPhoto || isPending}
              onClick={handleComplete}
            />
          </footer>
        ) : (
          <footer
            className={joinClassNames(
              styles.actions,
              isOverdue ? styles.threeActions : "",
            )}
          >
            {isWaiting ? (
              <Button
                className={styles.actionButton}
                kind="fill"
                size="Default"
                color="Primary"
                status="Default"
                text="수령 처리"
                type="button"
                onClick={handleStartProcess}
              />
            ) : (
              <>
                <Button
                  className={styles.actionButton}
                  kind="border"
                  size="Default"
                  color="Neutral"
                  status="Default"
                  text="대여 시 사진 보기"
                  type="button"
                  aria-disabled="true"
                  title="대여 사진 데이터가 연결되지 않았습니다."
                />

                {isOverdue ? (
                  <Button
                    className={styles.actionButton}
                    kind="border"
                    size="Default"
                    color="Danger"
                    status="Default"
                    text="학생 상세 페이지"
                    type="button"
                    aria-disabled="true"
                    title="회원 상세 경로가 연결되지 않았습니다."
                  />
                ) : null}

                <Button
                  className={styles.actionButton}
                  kind="fill"
                  size="Default"
                  color="Primary"
                  status="Default"
                  text="반납 처리"
                  type="button"
                  onClick={handleStartProcess}
                />
              </>
            )}
          </footer>
        )}
      </div>
    </BaseModal>
  );
}

export default RentalDetailModal;
