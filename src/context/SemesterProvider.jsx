import { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";

import { SemesterContext } from './SemesterContext';
import { fetchSemester } from '../api/semesterApi';


const EMPTY_SEMESTER = {
    year: null,
    term: null,
    startDate: null,
    endDate: null,
    preApplyStartDate: null,
    preApplyEndDate: null,
    pickupStartDate: null,
    pickupDeadline: null,
    onDemandStartDate: null,
    returnDeadline: null,
};

export function SemesterProvider({ children }) {
    const { isAuthenticated } = useUser();

    const {
        data: semesters,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["semester", "current"],
        queryFn: fetchSemester,
    });
    const semester = currentSemester ?? EMPTY_SEMESTER;


    const value = useMemo(() => ({
        currentSemester: semesters?.current ?? EMPTY_SEMESTER,
        isLoading,
        error,
    }), [semesters, isLoading, error]);


    return (
        <SemesterContext.Provider value={value}>
            {children}
        </SemesterContext.Provider>
    );
}
