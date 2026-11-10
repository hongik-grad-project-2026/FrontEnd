import { useContext, useId, useRef, useState } from "react";
import BaseModal from "./BaseModal";
import Button from "../common/Button";
import Select from "../common/Select";
import Input from "../common/Input";
import styles from "./RentalApplyModal.module.css";
import { SemesterContext } from "../../context/SemesterContext";
import { isMockMode } from "../../api/client";

function getNextDayDate(dateValue) {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return "";
  }

  const date = new Date(dateValue);
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
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
  const { semester } = useContext(SemesterContext);

  const [form, setForm] = useState(() => ({
    rentalType: equipment?.rentalPolicies ?? "",
    pickupDate: null,
    returnDate: "",
    reason: "",
  }));

  const isRegularRental = form.rentalType === "regular";
  const isAlwaysRental = form.rentalType === "always";


  const titleId = `${useId()}-title`;
  const pickupDateId = `${useId()}-pickup-date`;
  const reasonTextId = `${useId()}-reason-text`;
  const firstInputRef = useRef(null);
  const regularReturnDate = (
    isMockMode ? semester.endDate : semester.returnDeadline
  )?.slice(0, 10) ?? "";

  const resolvedReturnDate = isRegularRental
    ? regularReturnDate
    : isAlwaysRental
      ? getNextDayDate(form.pickupDate)
      : form.returnDate;
  const canSubmit =
    !isPending &&
    Boolean(form.rentalType) &&
    form.pickupDate instanceof Date &&
    !Number.isNaN(form.pickupDate.getTime()) &&
    Boolean(resolvedReturnDate) &&
    Boolean(form.reason.trim());

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleClose = (reason, event) => {
    if (!isPending) {
      onClose?.(reason, event);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canSubmit) {
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
                value={
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
              <label htmlFor={pickupDateId}>수령 희망일</label>
              <label >
                반납 예정일
                {isRegularRental
                  ? " (학기 반납 마감일)"
                  : isAlwaysRental
                    ? " (수령일 다음 날)"
                    : ""}
              </label>
              <Select
                ref={firstInputRef}
                id={pickupDateId}
                name="pickupDate"
                className={styles.select}
                type="calendar"
                width="100%"
                value={form.pickupDate}
                placeholder="날짜를 선택하세요."
                ariaLabel="수령 희망일"
                onChange={(date) => updateField("pickupDate", date)}
                disabled={isPending}
              />

              <Input
                width="100%"
                value={resolvedReturnDate}
                ariaLabel="반납 예정일"
                placeholder={
                  isRegularRental && !regularReturnDate
                    ? "학기 반납 마감일 미설정"
                    : "수령 희망일을 선택하세요."
                }
                disabled={true}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.wideLabel} htmlFor={reasonTextId}>대여 사유</label>
              <Input
                id={reasonTextId}
                name="reason"
                width={"100%"}
                height={"md"}
                placeholder="대여 사유를 입력하세요"
                disabled={isPending}
                onChange={(e) => updateField("reason", e.target.value)}
                value={form.reason}
              />
            </div>
          </section>

        </div>

        {error ? (
          <p className={styles.errorMessage} role="alert">
            {error.message || "대여 신청에 실패했습니다."}
          </p>
        ) : null}
        <footer className={styles.actions}>
          <Button kind="border" size="Default" color="Neutral" status="Default" text="돌아가기" disabled={isPending} onClick={(event) => handleClose("cancel", event)} />
          <Button kind="fill" size="Default" color="Primary" status="Default" text={isPending ? "신청 중" : "대여 신청"} type="submit" disabled={!canSubmit} />
        </footer>
      </form>
    </BaseModal>
  );
}

export default RentalApplyModal;
