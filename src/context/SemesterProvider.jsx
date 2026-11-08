import { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";

import { SemesterContext } from './SemesterContext';
import { getCurrentSemester } from '../api/semesterApi';


const EMPTY_SEMESTER = {
    year: null,
    term: null,
    startDate: null,
    endDate: null,
};

export function SemesterProvider({ children }) {

    const {
        data: semester = EMPTY_SEMESTER,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["semester", "current"],
        queryFn: getCurrentSemester,
    });


    const value = useMemo(() => ({
        semester,
        isLoading,
        error,
        isCustomSemester: Boolean(semester.startDate && semester.endDate),
    }), [semester, isLoading, error]);


    return (
        <SemesterContext.Provider value={value}>
            {children}
        </SemesterContext.Provider>
    );
}