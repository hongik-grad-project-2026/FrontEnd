import { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";

import { SemesterContext } from './SemesterContext';
import { getSemesterSchedule } from '../api/semesterApi';
import { isMockMode } from '../api/client';
import { useUser } from './UserContext';


const EMPTY_SEMESTER = {
    year: null,
    term: null,
    startDate: null,
    endDate: null,
};
const EMPTY_SCHEDULE = { previous: null, current: null, next: null };

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getDateOnly(value) {
    if (typeof value !== "string") {
        return null;
    }

    const dateOnly = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : null;
}

function isWithinDateRange(date, startDate, endDate) {
    const start = getDateOnly(startDate);
    const end = getDateOnly(endDate);

    return Boolean(start && end && date >= start && date <= end);
}

function getRentalTypeForDate(semester, date) {
    if (
        isWithinDateRange(
            date,
            semester.preApplyStartDate,
            semester.preApplyEndDate,
        )
    ) {
        return "regular";
    }

    if (
        isWithinDateRange(
            date,
            semester.onDemandStartDate,
            semester.returnDeadline,
        )
    ) {
        return "always";
    }

    return null;
}

export function SemesterProvider({ children }) {
    const { isAuthenticated } = useUser();

    const {
        data: semesterSchedule,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["semester", "schedule"],
        queryFn: ({ signal }) => getSemesterSchedule({ signal }),
        enabled: isAuthenticated,
    });
    const schedule = semesterSchedule ?? EMPTY_SCHEDULE;
    const semester = schedule.current ?? EMPTY_SEMESTER;
    const today = formatLocalDate(new Date());
    const rentalType = getRentalTypeForDate(semester, today);

    const value = useMemo(() => ({
        semester,
        schedule,
        rentalType,
        isLoading,
        error,
        isCustomSemester: Boolean(
            semester.startDate && (isMockMode ? semester.endDate : semester.returnDeadline),
        ),
    }), [semester, schedule, rentalType, isLoading, error]);


    return (
        <SemesterContext.Provider value={value}>
            {children}
        </SemesterContext.Provider>
    );
}
