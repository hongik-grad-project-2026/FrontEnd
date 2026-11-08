// import { isMockMode } from "./client";

//조회
export async function getCurrentSemester() {
    // 임시값
    const tempResult = {
        year: 2024,
        term: 1,
        startDate: "2024-03-03",
        endDate: "2024-06-06"
    };
    console.log("getCurrentSemester API 미연결, tempResult:", tempResult);

    return tempResult;
}

//저장
export async function saveSemester({ year, term, startDate, endDate }) {
    const data = {
        year,
        term,
        startDate,
        endDate
    };

    console.log("saveSemester API 미연결:", data);
    return;
}