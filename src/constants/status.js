const UNKNOWN_STATUS = { label: "알 수 없음", color: "gray" };

// 대여 상태
export const RENTAL_STATUS = Object.freeze({
    pendingApproval: { id: 0, label: "승인 대기", color: "yellow" },
    readyForPickup: { id: 1, label: "수령 대기", color: "blue" },
    renting: { id: 2, label: "대여 중", color: "green" },
    overdue: { id: 3, label: "연체", color: "red" },
    returned: { id: 4, label: "반납 완료", color: "light" },
    rejected: { id: 5, label: "반려", color: "gray" },
    canceled: { id: 6, label: "신청 취소", color: "gray" },
    noShow: { id: 7, label: "미수령", color: "gray" },
});
export const getRentalStatus = (value) => RENTAL_STATUS[value] ?? UNKNOWN_STATUS;


// 회원 상태
export const MEMBER_STATUS = Object.freeze({
    active: { id: 0, label: "일반회원", color: "light" },
    suspended: { id: 1, label: "블랙리스트", color: "black" },
    // withdrawn: { id: 2, label: "탈퇴", color: "gray" },
});


// '모델' 상태
export const MODEL_STATUS = Object.freeze({
    active: { id: 0, label: "대여 진행", color: "blue" },
    paused: { id: 1, label: "대여 중지", color: "red" },
});
const MODEL_STATUS_ALIASES = Object.freeze({
    available: "active",
    unavailable: "paused",
});
export const getModelStatus = (value) =>
    MODEL_STATUS[MODEL_STATUS_ALIASES[value] ?? value] ?? UNKNOWN_STATUS;


// '기기' 상태
export const ITEM_STATUS = Object.freeze({
    available: { id: 0, label: "대여 가능", color: "blue" },
    reserved: { id: 1, label: "신청 됨", color: "yellow" },
    rented: { id: 2, label: "대여 중", color: "green" },
    broken: { id: 3, label: "고장", color: "red" },
});
export const getItemStatus = (value) => ITEM_STATUS[value] ?? UNKNOWN_STATUS;
