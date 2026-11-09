import { api, isMockMode } from "./client";

const MOCK_CURRENT_SEMESTER = {
  year: 2026,
  term: 2,
  startDate: "2026-09-01",
  endDate: "2026-12-31",
};

export async function getCurrentSemester({ signal } = {}) {
  if (isMockMode) {
    return { ...MOCK_CURRENT_SEMESTER };
  }

  const schedule = await api.get("/semesters", { signal });
  if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
    throw new Error("학기 일정 응답 형식을 확인할 수 없습니다.");
  }

  const { current } = schedule;
  if (current == null) {
    return null;
  }
  if (typeof current !== "object" || Array.isArray(current)) {
    throw new Error("현재 학기 정보의 형식을 확인할 수 없습니다.");
  }

  return current;
}

export async function saveSemester(values) {
  if (!isMockMode) {
    throw new Error("현재 서버는 학기 일정 저장을 지원하지 않습니다.");
  }

  return { ...values };
}
