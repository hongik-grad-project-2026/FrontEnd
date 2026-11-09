// import { isMockMode } from "./client";

// 여기서 사전신청종료, 수령시작, 수령마감, 상시신청시작 시간 계산
// Context 흐름도 살피기
// 대여 로직에도 반영 필요

const MOCK_SEMESTERS_RESPONSE = {
    // isSuccess,
    // code,
    // message,
    result: {
        previous: {
            semesterId: 1,
            year: 2025,
            term: 2,
            startDate: "2025-09-01", // 학기 시작
            endDate: "2025-12-15", // 학기 종료
            preApplyStartDate: "2025-09-01", // 사전 신청 시작
            preApplyEndDate: "2025-09-07", // 사전 신청 종료
            pickupStartDate: "2025-09-08", // 수령 시작
            pickupDeadline: "2025-09-15T08:00:00.000Z", // 수령 마감
            onDemandStartDate: "2025-09-16", // 상시 신청 시작
            returnDeadline: "2025-12-15T08:00:00.000Z", // 반납 마감
        },
        current: {
            semesterId: 2,
            year: 2026,
            term: 1,
            startDate: "2026-03-03",
            endDate: "2026-06-16",
            preApplyStartDate: "2026-03-03",
            preApplyEndDate: "2026-03-10",
            pickupStartDate: "2026-03-11",
            pickupDeadline: "2026-03-18T08:00:00.000Z",
            onDemandStartDate: "2026-03-19",
            returnDeadline: "2026-06-16T08:00:00.000Z",
        },
        next: {
            semesterId: 3,
            year: 2026,
            term: 2,
            startDate: null,
            endDate: null,
            preApplyStartDate: null,
            preApplyEndDate: null,
            pickupStartDate: null,
            pickupDeadline: null,
            onDemandStartDate: null,
            returnDeadline: null,
        },
    }
};

export async function fetchSemester() {
    return structuredClone(MOCK_SEMESTERS_RESPONSE.result);
}

//저장
export async function saveSemester({
    semesterId,
    year,
    term,
    startDate,
    endDate,
    preApplyStartDate,
    preApplyEndDate,
    pickupStartDate,
    pickupDeadline,
    onDemandStartDate,
    returnDeadline,
}) {
    const data = {
        semesterId,
        year,
        term,
        startDate,
        endDate,
        preApplyStartDate,
        preApplyEndDate,
        pickupStartDate,
        pickupDeadline,
        onDemandStartDate,
        returnDeadline,
    };

    console.log("saveSemester API 미연결:", data);
    return;
}