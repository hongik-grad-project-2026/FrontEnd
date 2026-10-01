import { useEffect, useId, useRef, useState } from "react";

import Button from "../common/Button";
import InputBar from "../common/Input";
import BaseModal from "./BaseModal";

import styles from "./MemberEditModal.module.css";

const FIELDS = [
  { key: "name", label: "이름", type: "text" },
  { key: "email", label: "이메일", type: "email" },
  { key: "phoneNumber", label: "연락처", type: "tel" },
  { key: "college", label: "단과대", type: "text" },
  { key: "department", label: "학과", type: "text" },
];

function createInitialValues(member) {
  return {
    name: member.name ?? "",
    email: member.email ?? "",
    phoneNumber: member.phone ?? "",
    college: member.college ?? "",
    department: member.department ?? "",
  };
}

function MemberEditModal({
  error,
  isOpen,
  isPending,
  member,
  onClose,
  onSubmit,
  returnFocusRef,
}) {
  const generatedId = useId();
  const [initialValues] = useState(() => createInitialValues(member));
  const [values, setValues] = useState(initialValues);
  const isSubmittingRef = useRef(false);
  const titleId = `${generatedId}-title`;
  const errorId = `${generatedId}-error`;
  const canSubmit =
    !isPending &&
    FIELDS.some(({ key }) => values[key].trim() !== initialValues[key].trim());

  useEffect(() => {
    if (!isPending) {
      isSubmittingRef.current = false;
    }
  }, [error, isPending]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field) => (event) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: event.target.value,
    }));
  };

  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!canSubmit || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;

    const changedValues = Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, value.trim()])
        .filter(([key, value]) => value !== initialValues[key].trim()),
    );

    onSubmit(changedValues);
  };

  return (
    <BaseModal
      isOpen
      className={styles.modal}
      ariaLabelledBy={titleId}
      ariaDescribedBy={error ? errorId : undefined}
      closeOnEscape={!isPending}
      closeOnOverlay={!isPending}
      onClose={handleClose}
      returnFocusRef={returnFocusRef}
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            회원 정보 수정
          </h2>
        </header>

        <div className={styles.content}>
          <div className={styles.fields}>
            {FIELDS.map(({ key, label, type }) => {
              const inputId = `${generatedId}-${key}`;

              return (
                <div key={key} className={styles.field}>
                  <label className={styles.label} htmlFor={inputId}>
                    {label}
                  </label>

                  <InputBar
                    id={inputId}
                    width="100%"
                    height="md"
                    name={key}
                    type={type}
                    value={values[key]}
                    disabled={isPending}
                    onChange={handleChange(key)}
                  />
                </div>
              );
            })}
          </div>

          {error ? (
            <p id={errorId} className={styles.error} role="alert">
              {error.message || "회원 정보를 수정하지 못했습니다."}
            </p>
          ) : null}
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
            onClick={handleClose}
          />

          <Button
            className={styles.actionButton}
            kind="fill"
            size="Default"
            color="Primary"
            status="Default"
            text={isPending ? "수정 중" : "수정"}
            type="submit"
            disabled={!canSubmit}
          />
        </footer>
      </form>
    </BaseModal>
  );
}

export default MemberEditModal;
