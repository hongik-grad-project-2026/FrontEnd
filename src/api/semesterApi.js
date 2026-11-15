import { api, isMockMode } from "./client";

const MOCK_CURRENT_SEMESTER = {
    year: 2026,
    term: 2,
    startDate: "2026-09-01",
    endDate: "2026-12-31",
};

export async function getSemesterSchedule({ signal } = {}) {
    if (isMockMode) {
        return { previous: null, current: { ...MOCK_CURRENT_SEMESTER }, next: null };
    }

    const schedule = await api.get("/semesters", { signal });
    if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
        throw new Error("학기 일정 응답 형식을 확인할 수 없습니다.");
    }

    for (const key of ["previous", "current", "next"]) {
        const semester = schedule[key];
        if (semester != null && (typeof semester !== "object" || Array.isArray(semester))) {
            throw new Error(`${key} 학기 정보의 형식을 확인할 수 없습니다.`);
        }
    }

    return schedule;
}

export async function getCurrentSemester(options) {
    const schedule = await getSemesterSchedule(options);
    return schedule.current ?? null;
}

export async function saveSemester(values) {
    if (!isMockMode) {
        throw new Error("현재 서버는 학기 일정 저장을 지원하지 않습니다.");
    }

    return { ...values };
}
