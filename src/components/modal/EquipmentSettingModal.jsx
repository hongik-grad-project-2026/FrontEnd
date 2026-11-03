import BaseModal from "./BaseModal";
import styles from "./EquipmentSettingModal.module.css";
import Select from "../common/Select";
import Button from "../common/Button";
import { useContext, useState, useId } from "react";
import { SemesterContext } from "../../context/SemesterContext";

function addDays(date, days) {
    if (!date) {
        return null;
    }

    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function toDateOnly(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(date) {
    if (!date) {
        return null;
    }

    const parsedDate = date instanceof Date ? date : new Date(`${date}T00:00:00`);

    return Number.isNaN(parsedDate.getTime())
        ? null
        : parsedDate.toLocaleDateString();
}

function formatPeriod(period) {
    const start = formatDate(period?.start);
    const end = formatDate(period?.end);

    return start && end ? `${start} ~ ${end}` : "미정";
}


function EuipmentSettingModal({
    isOpen = true,
    isPending = false,
    onClose,
    onConfirm,
    returnFocusRef,
}) {
    const startDateId = useId();
    const endDateId = useId();
    const { semester, isCustomSemester } = useContext(SemesterContext);

    const [formValues, setFormValues] = useState(() => ({
        startDate: semester.startDate ? (semester.startDate instanceof Date ? semester.startDate : new Date(`${semester.startDate}T00:00:00`)) : null,
        endDate: semester.endDate ? (semester.endDate instanceof Date ? semester.endDate : new Date(`${semester.endDate}T00:00:00`)) : null,
    }));

    const preApplyPeriod = formValues.startDate ? {
        start: formValues.startDate,
        end: addDays(formValues.startDate, 13),
    } : null;

    const regularApplyPeriod = formValues.endDate && formValues.startDate ? {
        start: addDays(formValues.startDate, 14),
        end: formValues.endDate,
    } : null;

    const isRequiredFormComplete = formValues.startDate && formValues.endDate;


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isRequiredFormComplete || isPending) {
            return;
        }

        onConfirm({
            year: semester.year,
            term: semester.term,
            startDate: toDateOnly(formValues.startDate),
            endDate: toDateOnly(formValues.endDate),
        });
        // updateSemester // 부모의 mutation 성공 처리에서 갱신
    };

    return (
        <BaseModal
            className={styles.modal}
            isOpen={isOpen}
            onClose={onClose}
            // ariaLabelledBy={titleId}
            closeOnEscape={!isPending}
            closeOnOverlay={!isPending}
            returnFocusRef={returnFocusRef}
        >
            <form className={styles.form}
                onSubmit={handleSubmit}
            >
                <header className={styles.header}>
                    <h2>기자재 통합 설정</h2>
                </header>

                <div className={styles.content}>
                    <div className={styles.contentTitle}>
                        {semester.year}학년도 {semester.term}학기 일정
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}
                            htmlFor={startDateId}
                        >
                            시작일
                        </label>
                        <Select
                            id={startDateId}
                            className={styles.select}
                            type="calendar"
                            width="100%"
                            value={formValues.startDate}
                            placeholder="날짜를 선택하세요."
                            ariaLabel="시작일"
                            onChange={(nextDate) =>
                                setFormValues(prev => ({ ...prev, startDate: nextDate }))
                            }
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}
                            htmlFor={endDateId}
                        >
                            종료일
                        </label>
                        <Select
                            id={endDateId}
                            className={styles.select}
                            type="calendar"
                            width="100%"
                            value={formValues.endDate}
                            placeholder="날짜를 선택하세요."
                            ariaLabel="종료일"
                            onChange={(nextDate) =>
                                setFormValues(prev => ({ ...prev, endDate: nextDate }))
                            }
                        />
                    </div>
                    {!isCustomSemester ? <p className={styles.alertText}>
                        ⚠ 학기 일정이 아직 설정되지 않았습니다. 실제 일정에 맞게 설정을 완료해주세요.
                    </p> : ""}
                </div>
                <div className={styles.content}>
                    <div className={styles.contentTitle}>
                        대여 신청 일정
                        <span> (학기 일정 기준 자동 설정)</span>
                    </div>
                    <ol>
                        <li>
                            <span> • 사전 신청 기간</span>
                            <span className={styles.periodBox}>{formatPeriod(preApplyPeriod)}</span>
                            <span className={styles.noticeText}>학기 시작일부터 2주간 진행됩니다.</span>
                        </li>
                        <li>
                            <span> • 상시 신청 기간</span>
                            <span className={styles.periodBox}>{formatPeriod(regularApplyPeriod)}</span>
                            <span className={styles.noticeText}>사전 신청 종료 후 학기 종료일까지 진행됩니다.</span>
                        </li>
                    </ol>
                </div>
                <div className={styles.buttonWrapper}>
                    <Button
                        className={styles.cancelButton}
                        color="Neutral"
                        kind="border"
                        size="Default"
                        status="Default"
                        text="취소"
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                    />

                    <Button
                        className={styles.submitButton}
                        color="Primary"
                        kind="fill"
                        size="Default"
                        status="Default"
                        text={isPending ? "처리 중" : "설정 완료"}
                        type="submit"
                        disabled={isPending || !isRequiredFormComplete}
                    />
                </div>
            </form>
        </BaseModal>
    );

}


export default EuipmentSettingModal;
