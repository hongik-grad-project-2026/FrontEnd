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