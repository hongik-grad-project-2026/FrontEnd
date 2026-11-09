import BaseModal from "./BaseModal";
import styles from "./EquipmentSettingModal.module.css";
import Select from "../common/Select";
import Button from "../common/Button";
import { useContext, useState, useId } from "react";
import { SemesterContext } from "../../context/SemesterContext";
import { isMockMode } from "../../api/client";

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

function toCalendarDate(value) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value !== "string") {
        return null;
    }

    const datePart = value.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return null;
    }

    const date = new Date(`${datePart}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}


function formatDate(date) {
    const parsedDate = toCalendarDate(date);
    if (!parsedDate) {
        return null;
    }

    return parsedDate.toLocaleDateString();
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
    const { semester, isCustomSemester, isLoading, error } = useContext(SemesterContext);

    const [draftValues, setDraftValues] = useState(null);
    const formValues = isMockMode
        ? draftValues ?? {
            startDate: toCalendarDate(semester.startDate),
            endDate: toCalendarDate(semester.endDate),
        }
        : {
            startDate: toCalendarDate(semester.startDate),
            endDate: toCalendarDate(semester.returnDeadline),
        };

    const preApplyPeriod = isMockMode && formValues.startDate ? {
        start: formValues.startDate,
        end: addDays(formValues.startDate, 13),
    } : {
        start: semester.preApplyStartDate,
        end: semester.preApplyEndDate,
    };

    const regularApplyPeriod = formValues.endDate && formValues.startDate ? {
        start: addDays(formValues.startDate, 14),
        end: formValues.endDate,
    } : null;

    const isRequiredFormComplete = Boolean(formValues.startDate && formValues.endDate);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isMockMode || !isRequiredFormComplete || isPending) {
            return;
        }

        onConfirm?.({
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
                        {semester.year && semester.term
                            ? `${semester.year}학년도 ${semester.term}학기 일정`
                            : "학기 일정"}
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
                                setDraftValues({ ...formValues, startDate: nextDate })
                            }
                            disabled={!isMockMode || isPending || isLoading}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}
                            htmlFor={endDateId}
                        >
                            {isMockMode ? "종료일" : "반납 마감일"}
                        </label>
                        <Select
                            id={endDateId}
                            className={styles.select}
                            type="calendar"
                            width="100%"
                            value={formValues.endDate}
                            placeholder="날짜를 선택하세요."
                            ariaLabel={isMockMode ? "종료일" : "반납 마감일"}
                            onChange={(nextDate) =>
                                setDraftValues({ ...formValues, endDate: nextDate })
                            }
                            disabled={!isMockMode || isPending || isLoading}
                        />
                    </div>
                    {isLoading ? <p className={styles.alertText}>학기 일정을 불러오는 중입니다.</p> : null}
                    {error ? <p className={styles.alertText} role="alert">학기 일정을 불러오지 못했습니다.</p> : null}
                    {!isLoading && !error && !isCustomSemester ? <p className={styles.alertText}>
                        학기 일정이 아직 설정되지 않았습니다.
                    </p> : null}
                    {!isMockMode ? <p className={styles.alertText}>
                        현재 서버는 학기 일정 조회만 지원하여 이 화면에서 저장할 수 없습니다.
                    </p> : null}
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
                            <span className={styles.noticeText}>{isMockMode ? "학기 시작일부터 2주간 진행됩니다." : "서버에 설정된 기간입니다."}</span>
                        </li>
                        <li>
                            <span> • 상시 신청 기간</span>
                            <span className={styles.periodBox}>
                                {isMockMode
                                    ? formatPeriod(regularApplyPeriod)
                                    : semester.onDemandStartDate
                                        ? `${formatDate(semester.onDemandStartDate)}부터`
                                        : "미정"}
                            </span>
                            <span className={styles.noticeText}>{isMockMode ? "사전 신청 종료 후 학기 종료일까지 진행됩니다." : "신청 종료일은 서버 응답에 없습니다."}</span>
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
                        text={isPending ? "처리 중" : isMockMode ? "설정 완료" : "저장 미지원"}
                        type="submit"
                        disabled={!isMockMode || isPending || isLoading || !isRequiredFormComplete}
                    />
                </div>
            </form>
        </BaseModal>
    );

}


export default EuipmentSettingModal;
