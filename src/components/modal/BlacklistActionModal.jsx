import { useId, useRef, useState } from "react";

import Button from "../common/Button";
import BaseModal from "./BaseModal";
import styles from "./BlacklistActionModal.module.css";

function BlacklistActionModal({ action, memberName, semester, isPending, error, onClose, onSubmit }) {
  const generatedId = useId();
  const submitRef = useRef(false);
  const [reason, setReason] = useState("");
  const isRegister = action.type === "register";
  const semesterId = semester?.semesterId;
  const title = isRegister ? "블랙리스트 등록" : "블랙리스트 해제";
  const canSubmit = !isPending && reason.trim().length > 0 && reason.trim().length <= 500 &&
    (!isRegister || (Number.isSafeInteger(semesterId) && semesterId > 0));
  const titleId = `${generatedId}-title`;
  const errorId = `${generatedId}-error`;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || submitRef.current) return;
    submitRef.current = true;
    Promise.resolve(onSubmit({ semesterId, reason: reason.trim() }))
      .catch(() => {})
      .finally(() => { submitRef.current = false; });
  };

  return (
    <BaseModal
      isOpen
      className={styles.modal}
      ariaLabelledBy={titleId}
      ariaDescribedBy={error ? errorId : undefined}
      closeOnEscape={!isPending}
      closeOnOverlay={!isPending}
      onClose={isPending ? undefined : onClose}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <header className={styles.header}><h2 id={titleId}>{title}</h2></header>
        <div className={styles.content}>
          <p>{isRegister
            ? `${memberName} 학생의 현재 학기 등록 사유를 입력해 주세요.`
            : `${action.record.semesterName ?? "해당 학기"}의 블랙리스트 기록을 해제합니다.`}
          </p>
          {isRegister ? (
            <div className={styles.field}>
              <span>적용 학기</span>
              <span className={styles.semesterValue}>
                {semester.year}년 {semester.term}학기
              </span>
            </div>
          ) : null}
          <label className={styles.field} htmlFor={`${generatedId}-reason`}>
            <span>{isRegister ? "등록 사유" : "해제 사유"}</span>
            <textarea
              id={`${generatedId}-reason`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              rows={4}
              disabled={isPending}
              required
              placeholder={isRegister ? "등록 사유를 입력해 주세요" : "해제 사유를 입력해 주세요"}
            />
            <small>{reason.length}/500</small>
          </label>
          {error ? <p id={errorId} className={styles.error} role="alert">{error.message}</p> : null}
        </div>
        <footer className={styles.actions}>
          <Button kind="border" size="Default" color="Neutral" status="Default"
            text="취소" type="button" disabled={isPending} onClick={onClose} />
          <Button kind={isRegister ? "border" : "fill"} size="Default" color={isRegister ? "Danger" : "Primary"}
            status="Default" text={isPending ? "처리 중..." : title}
            type="submit" disabled={!canSubmit} />
        </footer>
      </form>
    </BaseModal>
  );
}

export default BlacklistActionModal;
