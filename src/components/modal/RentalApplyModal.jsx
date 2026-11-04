import { useId, useRef, useState } from "react";
import BaseModal from "./BaseModal";
import Button from "../common/Button";
import Select from "../common/Select";
import Input from "../common/Input";
import styles from "./RentalApplyModal.module.css";
import { SEMESTER_END_DATE } from "../../utils/rentalRules";

const SEMESTER_END_DATE_VALUE = SEMESTER_END_DATE.toISOString().slice(0, 10);

function createInitialForm(equipment) {
  return {
    rentalType: equipment?.rentalPolicies ?? "",
    pickupDate: "",
    returnDate: "",
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
  const [form, setForm] = useState(() => createInitialForm(equipment));



  const titleId = `${useId()}-title`;
  const firstInputRef = useRef(null);
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
          <section className={styles.infoSection}>
            <label className={styles.wideLabel}>기자재 정보</label>
            <div className={styles.infoGrid}>
              <div><span>카테고리</span>{equipment.category || "-"}</div>
              <div><span>기자재명</span>{equipment.modelName || "-"}</div>
              <div><span>설명</span>{equipment.description || "-"}</div>
              <div><span>구성</span>{equipment.components || "-"}</div>
            </div>
          </section>

          <section className={styles.fields}>

            <div className={styles.field}>
              <label className={styles.wideLabel}>대여 유형</label>
              <Input
                width="100%"
                placeholder={
                  equipment.rentalPolicies === "regular"
                    ? "정기"
                    : equipment.rentalPolicies === "always"
                      ? "상시"
                      : equipment.rentalPolicies ?? ""
                }
                ariaLabel="대여 유형"
                disabled={true}
              />
            </div>

            <div className={styles.field}>
              <label>수령 희망일</label>
              <label>
                반납 예정일
                {isRegularRental
                  ? " (학기말)"
                  : isAlwaysRental
                    ? " (수령일 다음 날)"
                    : ""}
              </label>
              <Select
                // id={startDateId}
                className={styles.select}
                type="calendar"
                width="100%"
                // ref={}
                value={form.pickupDate}
                placeholder="날짜를 선택하세요."
                ariaLabel="수령 희망일"
                onChange={updateField}
                disabled={isPending}
              />

              <Input
                // id={startDateId}
                // ref={}
                width="100%"
                value={resolvedReturnDate}
                placeholder="수령 희망일을 선택하세요."
                ariaLabel="수령 희망일"
                onChange={updateField}
                disabled={true}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.wideLabel}>대여 사유</label>
              <Input
                width={"100%"}
                height={"md"}
                placeholder="대여 사유를 입력하세요"
                disabled={isPending}
                onChange={updateField}
              // value=
              />
            </div>
          </section>

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
