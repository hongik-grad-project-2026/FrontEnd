import { isMockMode } from "./client";
import {
    cancelMockStudentRental,
    getMockStudentRentalCounts,
    getMockStudentRentalDetail,
    MOCK_STUDENT_RENTAL_CANCEL_REASONS,
    queryMockStudentRentals,
} from "../mocks/studentRentalData";

function getDateKey(date) {
    const pad = (value) => String(value).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
export const today = getDateKey(new Date());

const RENTAL_STATUSES = ["대여중", "승인대기", "수령대기", '반납완료', '신청취소'];

// 임시 목업 데이터
export const MOCK_RENTALS = [
    {
        id: 1,
        status: "승인대기",
        expectedPickupAt: null,
        actualPickupAt: null,
        expectedReturnAt: null,
        actualReturnAt: null,
    },
    {
        id: 2,
        status: "수령대기",
        expectedPickupAt: today,
        actualPickupAt: null,
        expectedReturnAt: "2026-12-31",
        actualReturnAt: null,
    },
    {
        id: 3,
        status: "대여중",
        expectedPickupAt: "2026-03-04",
        actualPickupAt: "2026-03-04",
        expectedReturnAt: "2026-12-31",
        actualReturnAt: null,
    },
    {
        id: 4,
        status: "대여중",
        expectedPickupAt: "2026-03-04",
        actualPickupAt: "2026-03-04",
        expectedReturnAt: today,
        actualReturnAt: null,
    },
    {
        id: 5,
        status: "대여중",
        expectedPickupAt: "2026-03-04",
        actualPickupAt: "2026-03-04",
        expectedReturnAt: "2026-04-03",
        actualReturnAt: null,
    },
    {
        id: 6,
        status: "수령대기",
        expectedPickupAt: today,
        actualPickupAt: null,
        expectedReturnAt: "2026-12-31",
        actualReturnAt: null,
    },
    {
        id: 7,
        status: "반납완료",
        expectedPickupAt: "2026-03-04",
        actualPickupAt: "2026-03-04",
        expectedReturnAt: "2026-04-03",
        actualReturnAt: "2026-04-03",
    },
]

// 임시 API
export async function fetchRentals({ statuses = RENTAL_STATUSES } = {}) {
    return MOCK_RENTALS.filter((rental) => statuses.includes(rental.status));
}

function normalizeStudentRentalListParams(params = {}) {
    return {
        status: params.status ?? "all",
        keyword: params.keyword?.trim() ?? "",
        page: params.page ?? 0,
        size: params.size ?? 50,
    };
}

export const studentRentalKeys = {
    all: ["student-rentals"],
    lists: () => ["student-rentals", "list"],
    list: (params) => [
        "student-rentals",
        "list",
        normalizeStudentRentalListParams(params),
    ],
    counts: () => ["student-rentals", "counts"],
    details: () => ["student-rentals", "detail"],
    detail: (rentalId) => ["student-rentals", "detail", String(rentalId)],
    dashboard: () => ["student-rentals", "dashboard"],
};

export const studentRentalCancelReasons = MOCK_STUDENT_RENTAL_CANCEL_REASONS;

function assertStudentRentalMockMode() {
    if (isMockMode) {
        return;
    }

    const error = new Error("대여 API가 아직 제공되지 않았습니다.");
    error.code = "STUDENT_RENTAL_API_UNAVAILABLE";
    throw error;
}

// Swagger에 학생 대여 API가 추가되면 아래 함수 안의 요청만 실제 API로 교체해.
// 페이지는 mock 저장소를 직접 알지 않고 이 경계만 사용해.
export async function getStudentRentals(params = {}) {
    assertStudentRentalMockMode();
    return queryMockStudentRentals({
        ...normalizeStudentRentalListParams(params),
        signal: params.signal,
    });
}

export async function getStudentRentalCounts(options = {}) {
    assertStudentRentalMockMode();
    return getMockStudentRentalCounts(options);
}

export async function getStudentRentalDetail(rentalId, options = {}) {
    assertStudentRentalMockMode();
    return getMockStudentRentalDetail(rentalId, options);
}

export async function cancelStudentRental(values) {
    assertStudentRentalMockMode();
    return cancelMockStudentRental(values);
}

export async function getStudentRentalDashboard(options = {}) {
    assertStudentRentalMockMode();

    const { content } = await queryMockStudentRentals({
        page: 0,
        size: 50,
        status: "all",
        signal: options.signal,
    });

    return {
        approvalPending: content.filter(
            (rental) => rental.status === "approvalPending",
        ),
        pickupPending: content.filter(
            (rental) => rental.status === "pickupPending",
        ),
        renting: content.filter(
            (rental) => rental.status === "renting" || rental.status === "overdue",
        ),
    };
}
