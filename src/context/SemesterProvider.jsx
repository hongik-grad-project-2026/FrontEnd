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


    const value = useMemo(() => ({
        semester,
        schedule,
        isLoading,
        error,
        isCustomSemester: Boolean(
            semester.startDate && (isMockMode ? semester.endDate : semester.returnDeadline),
        ),
    }), [semester, schedule, isLoading, error]);


    return (
        <SemesterContext.Provider value={value}>
            {children}
        </SemesterContext.Provider>
    );
}
