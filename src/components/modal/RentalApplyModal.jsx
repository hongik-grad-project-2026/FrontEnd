import { useContext, useId, useRef, useState } from "react";
import BaseModal from "./BaseModal";
import Button from "../common/Button";
import Select from "../common/Select";
import Input from "../common/Input";
import styles from "./RentalApplyModal.module.css";
import { SemesterContext } from "../../context/SemesterContext";
import { isMockMode } from "../../api/client";
import {
  getFixedPickupDate,
  getNextDayReturnDeadline,
  isFixedPickupCategory,
} from "../../utils/rentalRules";

const RENTAL_TYPE_LABELS = {
  regular: "정기",
  always: "상시",
};

function toCalendarBoundary(value, endOfDay = false) {
  if (typeof value !== "string") {
    return undefined;
  }

  const dateOnly = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return undefined;
  }

  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
}

function formatDateOnly(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

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
  const {
    semester,
    rentalType: scheduledRentalType,
    isLoading: isSemesterLoading,
    error: semesterError,
  } = useContext(SemesterContext);

  const hasFixedPickupDate = isFixedPickupCategory(equipment?.category);
  const [fixedPickupDate] = useState(() =>
    getFixedPickupDate(equipment?.category),
  );
  const [form, setForm] = useState(() => ({
    rentalType: equipment?.rentalPolicies ?? "",
    pickupDate: fixedPickupDate,
    reason: "",
  }));

  const rentalType = isMockMode ? form.rentalType : scheduledRentalType;
  const isRegularRental = rentalType === "regular";
  const isAlwaysRental = rentalType === "always";
  const titleId = `${useId()}-title`;
  const pickupDateId = `${useId()}-pickup-date`;
  const reasonTextId = `${useId()}-reason-text`;
  const firstInputRef = useRef(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fixedPickupMaxDate = fixedPickupDate
    ? new Date(fixedPickupDate)
    : undefined;
  fixedPickupMaxDate?.setHours(23, 59, 59, 999);

  const pickupMinDate = hasFixedPickupDate
    ? fixedPickupDate ?? undefined
    : isRegularRental
      ? toCalendarBoundary(semester.pickupStartDate)
      : isAlwaysRental
        ? today
        : undefined;
  const pickupMaxDate = hasFixedPickupDate
    ? fixedPickupMaxDate
    : isRegularRental
      ? toCalendarBoundary(semester.pickupDeadline, true)
      : isAlwaysRental
        ? toCalendarBoundary(
          isMockMode ? semester.endDate : semester.returnDeadline,
          true,
        )
        : undefined;

  const returnDeadline = (
    isMockMode ? semester.endDate : semester.returnDeadline
  )?.slice(0, 10) ?? "";
  const fixedReturnDate = formatDateOnly(
    getNextDayReturnDeadline(fixedPickupDate),
  );
  const resolvedReturnDate = hasFixedPickupDate
    ? fixedReturnDate
    : returnDeadline;
  const resolvedExpectedReturnAt = hasFixedPickupDate
    ? `${fixedReturnDate}T20:00:00`
    : isMockMode
      ? `${returnDeadline}T20:00:00`
      : semester.returnDeadline ?? "";
  const canSubmit =
    !isPending &&
    form.pickupDate instanceof Date &&
    !Number.isNaN(form.pickupDate.getTime()) &&
    (isMockMode
      ? Boolean(form.rentalType) && Boolean(resolvedReturnDate)
      : Boolean(rentalType) && Boolean(resolvedReturnDate)) &&
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
      onSubmit?.({
        ...form,
        returnDate: resolvedReturnDate,
        expectedReturnAt: resolvedExpectedReturnAt,
      });
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
                  isMockMode
                    ? RENTAL_TYPE_LABELS[form.rentalType] ?? form.rentalType ?? ""
                    : isSemesterLoading
                      ? "학기 일정 확인 중"
                      : semesterError
                        ? "학기 일정 확인 실패"
                        : RENTAL_TYPE_LABELS[rentalType] ?? "현재 신청 기간 아님"
                }
                ariaLabel="대여 유형"
                disabled={true}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor={pickupDateId}>수령 희망일</label>
              <label>
                반납 예정일 {hasFixedPickupDate ? "(다음 날)" : "(학기 반납 마감일)"}
              </label>
              {hasFixedPickupDate ?
                <Input
                  width="100%"
                  value={formatDateOnly(form.pickupDate)}
                  ariaLabel="수령 희망일"
                  placeholder="수령 희망일 미설정"
                  disabled={true}
                />
                :
                <Select
                  ref={firstInputRef}
                  id={pickupDateId}
                  name="pickupDate"
                  type="calendar"
                  width="100%"
                  minDate={pickupMinDate}
                  maxDate={pickupMaxDate}
                  value={form.pickupDate}
                  placeholder="날짜를 선택하세요."
                  ariaLabel="수령 희망일"
                  onChange={(date) => updateField("pickupDate", date)}
                  disabled={isPending || hasFixedPickupDate}
                />}

              <Input
                width="100%"
                value={resolvedReturnDate}
                ariaLabel="반납 예정일"
                placeholder="학기 반납 마감일 미설정"
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
