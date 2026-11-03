import { useId, useRef, useState } from "react";
import BaseModal from "./BaseModal";
import Button from "../common/Button";
import styles from "./RentalApplyModal.module.css";
import { SEMESTER_END_DATE } from "../../utils/rentalRules";

const SEMESTER_END_DATE_VALUE = SEMESTER_END_DATE.toISOString().slice(0, 10);

function createInitialForm(equipment) {
  return {
    rentalType: equipment?.rentalPolicies ?? "",
    pickupDate: "",
    pickupTime: "",
    returnDate: "",
    returnTime: "",
    reason: "",
  };
}

function getNextDayDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function RentalApplyModal(props) {
  const { equipment, isOpen = false } = props;

  if (!equipment) {
    return null;
  }

  const modalKey = `${equipment.modelId}:${isOpen}`;

  return <RentalApplyModalContent key={modalKey} {...props} />;
}

function RentalApplyModalContent({
  equipment,
  error,
  isOpen = false,
  isPending = false,
  onClose,
  onSubmit,
  returnFocusRef,
}) {
  const titleId = `${useId()}-title`;
  const firstInputRef = useRef(null);
  const [form, setForm] = useState(() => createInitialForm(equipment));
  const isRegularRental = form.rentalType === "regular";
  const isAlwaysRental = form.rentalType === "always";
  const isReturnDateFixed = isRegularRental || isAlwaysRental;
  const resolvedReturnDate = isRegularRental
    ? SEMESTER_END_DATE_VALUE
    : isAlwaysRental
      ? getNextDayDate(form.pickupDate)
      : form.returnDate;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleClose = (reason, event) => {
    if (!isPending) {
      onClose?.(reason, event);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isPending) {
      onSubmit?.({ ...form, returnDate: resolvedReturnDate });
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnEscape={!isPending}
      closeOnOverlay={!isPending}
      className={styles.modal}
      ariaLabelledBy={titleId}
      initialFocusRef={firstInputRef}
      returnFocusRef={returnFocusRef}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h2 id={titleId}>대여 신청하기</h2>
        </header>

        <div className={styles.body}>
          <section>
            <h3>기자재 정보</h3>
            <dl className={styles.infoGrid}>
              <div><dt>카테고리</dt><dd>{equipment.category || "-"}</dd></div>
              <div><dt>기자재명</dt><dd>{equipment.modelName || "-"}</dd></div>
              <div><dt>설명</dt><dd>{equipment.description || "-"}</dd></div>
              <div><dt>구성</dt><dd>{equipment.components || "-"}</dd></div>
            </dl>
          </section>

          <section>
            <h3>신청 정보</h3>
            <div className={styles.fields}>
              <label>
                <span>대여 유형</span>
                <select ref={firstInputRef} name="rentalType" value={form.rentalType} onChange={updateField} disabled={true}>
                  <option value={equipment.rentalPolicies ?? ""}>
                    {equipment.rentalPolicies === "regular"
                      ? "정기"
                      : equipment.rentalPolicies === "always"
                        ? "상시"
                        : equipment.rentalPolicies ?? ""}
                  </option>
                </select>
              </label>
              <label>
                <span>수령 희망일</span>
                <span className={styles.dateTime}>
                  <input required type="date" name="pickupDate" value={form.pickupDate} onChange={updateField} disabled={isPending} />
                  <input required type="time" name="pickupTime" value={form.pickupTime} onChange={updateField} disabled={isPending} />
                </span>
              </label>
              <label>
                <span>
                  반납 예정일
                  {isRegularRental
                    ? " (학기말)"
                    : isAlwaysRental
                      ? " (수령일 다음 날)"
                      : ""}
                </span>
                <span className={styles.dateTime}>
                  <input required type="date" name="returnDate" value={resolvedReturnDate} onChange={updateField} disabled={isPending || isReturnDateFixed} />
                  <input required type="time" name="returnTime" value={form.returnTime} onChange={updateField} disabled={isPending} />
                </span>
              </label>
              <label className={styles.reasonField}>
                <span>대여 사유</span>
                <textarea required name="reason" value={form.reason} onChange={updateField} disabled={isPending} maxLength={500} />
              </label>
            </div>
          </section>

          {error ? <p className={styles.error} role="alert">{error.message || "대여 신청에 실패했습니다."}</p> : null}
        </div>

        <footer className={styles.actions}>
          <Button kind="border" size="Default" color="Neutral" status="Default" text="돌아가기" disabled={isPending} onClick={(event) => handleClose("cancel", event)} />
          <Button kind="fill" size="Default" color="Primary" status="Default" text={isPending ? "신청 중" : "대여 신청"} type="submit" disabled={isPending} />
        </footer>
      </form>
    </BaseModal>
  );
}

export default RentalApplyModal;
