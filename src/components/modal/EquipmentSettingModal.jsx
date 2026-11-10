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
    const { semester, schedule, isCustomSemester, isLoading, error } = useContext(SemesterContext);
    const semesterKeys = ["previous", "current", "next"];
    const [selectedKey, setSelectedKey] = useState("current");
    const selectedIndex = semesterKeys.indexOf(selectedKey);
    const selectedSemester = schedule[selectedKey];
    const canGoPrevious = selectedIndex > 0 && Boolean(schedule[semesterKeys[selectedIndex - 1]]);
    const canGoNext = selectedIndex < semesterKeys.length - 1 && Boolean(schedule[semesterKeys[selectedIndex + 1]]);

    const [draftValues, setDraftValues] = useState(null);
    const formValues = isMockMode && selectedKey === "current"
        ? draftValues ?? {
            startDate: toCalendarDate(selectedSemester?.startDate),
            endDate: toCalendarDate(selectedSemester?.endDate),
        }
        : {
            startDate: toCalendarDate(selectedSemester?.startDate),
            endDate: toCalendarDate(selectedSemester?.returnDeadline),
        };

    const preApplyPeriod = isMockMode && formValues.startDate ? {
        start: formValues.startDate,
        end: addDays(formValues.startDate, 6),
    } : {
        start: selectedSemester?.preApplyStartDate,
        end: selectedSemester?.preApplyEndDate,
    };

    const pickupPeriod = isMockMode && formValues.startDate ? {
        start: addDays(formValues.startDate, 7),
        end: addDays(formValues.startDate, 13),
    } : {
        start: selectedSemester?.pickupStartDate,
        end: selectedSemester?.pickupDeadline,
    };

    const onDemandPeriod = isMockMode && formValues.startDate ? {
        start: addDays(formValues.startDate, 14),
        end: formValues.endDate,
    } : {
        start: selectedSemester?.onDemandStartDate,
        end: selectedSemester?.returnDeadline,
    };

    const isRequiredFormComplete = Boolean(formValues.startDate && formValues.endDate);
    const hasSelectedSchedule = selectedKey === "current"
        ? isCustomSemester
        : Boolean(selectedSemester?.startDate && selectedSemester?.returnDeadline);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isMockMode || selectedKey !== "current" || !isRequiredFormComplete || isPending) {
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
                            disabled={!canGoPrevious || isLoading}
                            onClick={() => setSelectedKey(semesterKeys[selectedIndex - 1])}
                        />
                        <p>
                            {selectedSemester?.year && selectedSemester?.term
                                ? `${selectedSemester.year}학년도 ${selectedSemester.term}학기 일정`
                                : isLoading ? "학기 일정 불러오는 중" : "학기 일정 없음"}
                        </p>
                        <Button
                            color="Neutral"
                            kind="border"
                            size="Xsmall"
                            status="Default"
                            text="다음"
                            type="button"
                            disabled={!canGoNext || isLoading}
                            onClick={() => setSelectedKey(semesterKeys[selectedIndex + 1])}
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
                            onChange={(nextDate) =>
                                setDraftValues({ ...formValues, startDate: nextDate })
                            }
                            disabled={!isMockMode || selectedKey !== "current" || isPending || isLoading}
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
                            disabled={!isMockMode || selectedKey !== "current" || isPending || isLoading}
                        />
                    </div>
                    {isLoading ? <p className={styles.alertText}>학기 일정을 불러오는 중입니다.</p> : null}
                    {error ? <p className={styles.alertText} role="alert">학기 일정을 불러오지 못했습니다.</p> : null}
                    {!isLoading && !error && !hasSelectedSchedule ? <p className={styles.alertText}>
                        학기 일정이 아직 설정되지 않았습니다.
                    </p> : null}
                    {!isMockMode ? <p className={styles.alertText}>
                        현재 서버는 학기 일정 조회만 지원하여 이 화면에서 저장할 수 없습니다.
                    </p> : null}
                </div>
                <div className={styles.content}>
                    <div className={styles.contentTitle}>
                        대여 신청 일정
                        <span> {isMockMode ? "(학기 일정 기준 자동 설정)" : "(서버에 설정된 일정)"}</span>
                    </div>
                    <ol>
                        <li>
                            <span> • 사전신청</span>
                            <span className={styles.periodBox}>{formatPeriod(preApplyPeriod)}</span>
                            <span className={styles.noticeText}>{isMockMode ? "학기 시작일부터 1주" : "서버에 설정된 기간"}</span>
                        </li>
                        <li>
                            <span> • 사전신청 수령</span>
                            <span className={styles.periodBox}>{formatPeriod(pickupPeriod)}</span>
                            <span className={styles.noticeText}>{isMockMode ? "사전신청 종료 후 1주" : "서버에 설정된 기간"}</span>
                        </li>
                        <li>
                            <span> • 상시신청 및 수령</span>
                            <span className={styles.periodBox}>{formatPeriod(onDemandPeriod)}</span>
                            <span className={styles.noticeText}>{isMockMode ? "사전신청 수령 후 학기 종료일까지" : "서버에 설정된 기간"}</span>
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
                        disabled={!isMockMode || selectedKey !== "current" || isPending || isLoading || !isRequiredFormComplete}
                    />
                </div>
            </form>
        </BaseModal>
    );

}


export default EuipmentSettingModal;
