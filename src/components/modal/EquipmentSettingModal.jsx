import BaseModal from "./BaseModal";
import styles from "./EquipmentSettingModal.module.css";
import Select from "../common/Select";
import Button from "../common/Button";
import { useState, useId } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSemester } from "../../api/semesterApi";


function toDateOnly(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseSemesterDate(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const dateOnlyMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function addDays(date, days) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
    }

    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date) {
    const parsedDate = parseSemesterDate(date);
    return parsedDate?.toLocaleDateString() ?? null;
}

function formatPeriod(startDate, endDate) {
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    return start && end ? `${start} ~ ${end}` : "미정";
}

function getSemesterFormValues(semester) {
    return {
        startDate: parseSemesterDate(semester?.startDate),
        endDate: parseSemesterDate(semester?.endDate),
        preApplyStartDate: parseSemesterDate(semester?.preApplyStartDate),
        preApplyEndDate: parseSemesterDate(semester?.preApplyEndDate),
        pickupStartDate: parseSemesterDate(semester?.pickupStartDate),
        pickupDeadline: parseSemesterDate(semester?.pickupDeadline),
        onDemandStartDate: parseSemesterDate(semester?.onDemandStartDate),
        returnDeadline: parseSemesterDate(semester?.returnDeadline),
    };
}

function calculateRentalScheduleDates(startDate, endDate) {
    const preApplyStartDate = startDate;
    const preApplyEndDate = addDays(preApplyStartDate, 7);
    const pickupStartDate = addDays(preApplyEndDate, 1);
    const pickupDeadline = addDays(pickupStartDate, 7);

    return {
        preApplyStartDate,
        preApplyEndDate,
        pickupStartDate,
        pickupDeadline,
        onDemandStartDate: addDays(pickupDeadline, 1),
        returnDeadline: endDate,
    };
}

function EuipmentSettingModal({
    isOpen = true,
    isPending: isSaving = false,
    onClose,
    onConfirm,
    returnFocusRef,
}) {
    const startDateId = useId();
    const endDateId = useId();

    const SEMESTER_KEYS = ["previous", "current", "next"];
    const [selectedKey, setSelectedKey] = useState("current");

    const selectedIndex = SEMESTER_KEYS.indexOf(selectedKey);

    const canGoPrevious = selectedIndex > 0;
    const canGoNext = selectedIndex < SEMESTER_KEYS.length - 1;

    const {
        data: semesters,
        isPending: isSemesterLoading,
        error: semesterError,
    } = useQuery({
        queryKey: ["semesters"],
        queryFn: fetchSemester,
    });

    const semester = semesters?.[selectedKey];
    const isCustomSemester = Boolean(semester?.startDate && semester?.endDate);

    const [editedForm, setEditedForm] = useState(null);
    const formValues = editedForm && editedForm.semesterId === semester?.semesterId
        ? editedForm.values
        : getSemesterFormValues(semester);

    const updateFormDates = (updates) => {
        const nextValues = { ...formValues, ...updates };

        setEditedForm({
            semesterId: semester.semesterId,
            values: {
                ...nextValues,
                ...calculateRentalScheduleDates(nextValues.startDate, nextValues.endDate),
            },
        });
    };


    const isRequiredFormComplete = formValues.startDate && formValues.endDate;


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!semester || !isRequiredFormComplete || isSaving) {
            return;
        }

        onConfirm({
            semesterId: semester.semesterId,
            year: semester.year,
            term: semester.term,
            startDate: toDateOnly(formValues.startDate),
            endDate: toDateOnly(formValues.endDate),
            preApplyStartDate: toDateOnly(formValues.preApplyStartDate),
            preApplyEndDate: toDateOnly(formValues.preApplyEndDate),
            pickupStartDate: toDateOnly(formValues.pickupStartDate),
            pickupDeadline: toDateOnly(formValues.pickupDeadline),
            onDemandStartDate: toDateOnly(formValues.onDemandStartDate),
            returnDeadline: toDateOnly(formValues.returnDeadline),
        });
        // updateSemester // 부모의 mutation 성공 처리에서 갱신
    };

    return (
        <BaseModal
            className={styles.modal}
            isOpen={isOpen}
            onClose={onClose}
            // ariaLabelledBy={titleId}
            closeOnEscape={!isSaving}
            closeOnOverlay={!isSaving}
            returnFocusRef={returnFocusRef}
        >
            <form className={styles.form}
                onSubmit={handleSubmit}
            >
                <header className={styles.header}>
                    <h2>대여 일정 통합 관리</h2>
                </header>

                <div className={styles.content}>
                    <div className={styles.contentTitle}>
                        <Button
                            color="Neutral"
                            kind="border"
                            size="Xsmall"
                            status="Default"
                            text="이전"
                            type="button"
                            disabled={!canGoPrevious || isSemesterLoading}
                            onClick={() => setSelectedKey(SEMESTER_KEYS[selectedIndex - 1])}
                        />
                        <p>
                            {semester
                                ? `${semester.year}학년도 ${semester.term}학기 일정`
                                : isSemesterLoading
                                    ? "학기 일정 불러오는 중"
                                    : "학기 일정을 불러오지 못했습니다."}
                        </p>
                        <Button
                            color="Neutral"
                            kind="border"
                            size="Xsmall"
                            status="Default"
                            text="다음"
                            type="button"
                            disabled={!canGoNext || isSemesterLoading}
                            onClick={() => setSelectedKey(SEMESTER_KEYS[selectedIndex + 1])}
                        />
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
                            disabled={selectedKey === 'previous'}
                            onChange={(nextDate) =>
                                updateFormDates({ startDate: nextDate })
                            }
                            maxDate={formValues.endDate ? addDays(formValues.endDate, -14) : undefined}

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
                            disabled={selectedKey === 'previous'}
                            onChange={(nextDate) =>
                                updateFormDates({ endDate: nextDate })
                            }
                            minDate={formValues.startDate ? addDays(formValues.pickupDeadline, 1) : undefined}
                        />
                    </div>
                    {semesterError ? (
                        <p className={styles.alertText} role="alert">
                            {semesterError.message || "학기 일정을 불러오지 못했습니다."}
                        </p>
                    ) : null}
                    {semester && !isCustomSemester ? <p className={styles.alertText}>
                        ⚠ 학기 일정이 아직 설정되지 않았습니다. 실제 일정에 맞게 설정을 완료해주세요.
                    </p> : ""}
                </div>
                <div className={styles.content}>
                    <div className={styles.contentTitle}>
                        대여 신청 일정
                        <span>(학기 일정 기준 자동 설정)</span>
                    </div>
                    <ol>
                        <li>
                            <span> • 사전신청</span>
                            <span className={styles.periodBox}>{formatPeriod(formValues.preApplyStartDate, formValues.preApplyEndDate)}</span>
                            <span className={styles.noticeText}>학기 시작일부터 1주</span>
                        </li>
                        <li>
                            <span> • 사전신청 수령</span>
                            <span className={styles.periodBox}>{formatPeriod(formValues.pickupStartDate, formValues.pickupDeadline)}</span>
                            <span className={styles.noticeText}>사전신청 종료 후 1주</span>
                        </li>
                        <li>
                            <span> • 상시신청 및 수령</span>
                            <span className={styles.periodBox}>{formatPeriod(formValues.onDemandStartDate, formValues.returnDeadline)}</span>
                            <span className={styles.noticeText}>사전신청 수령 후 학기 종료일까지.</span>
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
                        disabled={isSaving}
                    />

                    <Button
                        className={styles.submitButton}
                        color="Primary"
                        kind="fill"
                        size="Default"
                        status="Default"
                        text={isSaving ? "처리 중" : "설정 완료"}
                        type="submit"
                        disabled={isSaving || isSemesterLoading || !semester || !isRequiredFormComplete}
                    />
                </div>
            </form>
        </BaseModal>
    );

}


export default EuipmentSettingModal;
