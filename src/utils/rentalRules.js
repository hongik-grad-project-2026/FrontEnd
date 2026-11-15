// 노트북과 태블릿은 수령 사진 필수, 그 외 카테고리는 선택 사항
const PICKUP_PHOTO_REQUIRED_CATEGORIES = new Set(["노트북", "태블릿"]);
// 보조배터리와 기타는 반납 사진 선택 사항
const RETURN_PHOTO_OPTIONAL_CATEGORIES = new Set(["보조배터리", "기타"]);
const FIXED_PICKUP_CATEGORIES = new Set(["보조배터리", "기타"]);

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

    return pickupDate;
}

export function getNextDayReturnDeadline(pickupDate) {
    if (!(pickupDate instanceof Date) || Number.isNaN(pickupDate.getTime())) {
        return null;
    }

    const returnDeadline = new Date(pickupDate);
    returnDeadline.setDate(returnDeadline.getDate() + 1);
    returnDeadline.setHours(20, 0, 0, 0);

    return returnDeadline;
}

export function isPickupPhotoRequired(category) {
    return PICKUP_PHOTO_REQUIRED_CATEGORIES.has(category);
}

export function isReturnPhotoRequired(category) {
    return !RETURN_PHOTO_OPTIONAL_CATEGORIES.has(category);
}
