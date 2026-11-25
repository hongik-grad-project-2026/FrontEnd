// 노트북과 태블릿은 수령 사진 필수, 그 외 카테고리는 선택 사항
const PICKUP_PHOTO_REQUIRED_CATEGORIES = new Set(["노트북", "태블릿"]);
// 보조배터리와 기타는 반납 사진 선택 사항
const RETURN_PHOTO_OPTIONAL_CATEGORIES = new Set(["보조배터리", "기타"]);
const FIXED_PICKUP_CATEGORIES = new Set(["보조배터리", "기타"]);


// 토요일(6)·일요일(0)이면 true를 반환함.
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

// 주어진 날짜가 주말이면 다음 평일로 옮긴 새 날짜를 반환함.
function toBusinessDay(date) {
    const next = new Date(date);
    while (isWeekend(next)) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}


export function isFixedPickupCategory(category) {
    return FIXED_PICKUP_CATEGORIES.has(category);
}

export function getFixedPickupDate(category, now = new Date()) {
    if (!isFixedPickupCategory(category) || Number.isNaN(now.getTime())) {
        return null;
    }

    const pickupDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pickupCutoff = new Date(pickupDate);
    pickupCutoff.setHours(20, 0, 0, 0);

    if (now.getTime() > pickupCutoff.getTime()) {
        pickupDate.setDate(pickupDate.getDate() + 1);
    }

    // 토요일(6)·일요일(0)이면 다음 평일로 미룬다. (주말에는 수령 불가)
    return toBusinessDay(pickupDate);
}

export function getNextDayReturnDeadline(pickupDate) {
    if (!(pickupDate instanceof Date) || Number.isNaN(pickupDate.getTime())) {
        return null;
    }

    const returnDeadline = new Date(pickupDate);
    returnDeadline.setDate(returnDeadline.getDate() + 1);

    // 토요일(6)·일요일(0)이면 다음 평일로 미룬다. (금요일 수령 → 월요일 반납)
    returnDeadline.setTime(toBusinessDay(returnDeadline).getTime());

    returnDeadline.setHours(20, 0, 0, 0);

    return returnDeadline;
}

// 상시대여 수령 가능한 기간의 시작일을 반환함. 마감 시각 이후면 다음 날부터.
export function getAlwaysRentalFirstAvailableDate(now = new Date()) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    if (now.getHours() >= 20) {
        date.setDate(date.getDate() + 1);
    }

    return toBusinessDay(date);
}

// 상시대여 수령 가능한 기간(총3일)의 종료일을 반환함.
export function getAlwaysRentalLastAvailableDate(now = new Date()) {
    const date = getAlwaysRentalFirstAvailableDate(now);
    date.setDate(date.getDate() + 2);
    return toBusinessDay(date);
}

export function isPickupPhotoRequired(category) {
    return PICKUP_PHOTO_REQUIRED_CATEGORIES.has(category);
}

export function isReturnPhotoRequired(category) {
    return !RETURN_PHOTO_OPTIONAL_CATEGORIES.has(category);
}
