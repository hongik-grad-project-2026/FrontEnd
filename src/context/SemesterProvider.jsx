import { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";

import { SemesterContext } from './SemesterContext';
import { getCurrentSemester } from '../api/semesterApi';
import { isMockMode } from '../api/client';
import { useUser } from './UserContext';


const EMPTY_SEMESTER = {
    year: null,
    term: null,
    startDate: null,
    endDate: null,
};

export function SemesterProvider({ children }) {
    const { isAuthenticated } = useUser();

    const {
        data: currentSemester,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["semester", "current"],
        queryFn: ({ signal }) => getCurrentSemester({ signal }),
        enabled: isAuthenticated,
    });
    const semester = currentSemester ?? EMPTY_SEMESTER;


    const value = useMemo(() => ({
        semester,
        isLoading,
        error,
        isCustomSemester: Boolean(
            semester.startDate && (isMockMode ? semester.endDate : semester.returnDeadline),
        ),
    }), [semester, isLoading, error]);


    return (
        <SemesterContext.Provider value={value}>
            {children}
        </SemesterContext.Provider>
    );
}
