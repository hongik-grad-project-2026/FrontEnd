// 노트북과 태블릿은 수령 사진 필수, 그 외 카테고리는 선택 사항
const PICKUP_PHOTO_REQUIRED_CATEGORIES = new Set(["노트북", "태블릿"]);

export function isPickupPhotoRequired(category) {
    return PICKUP_PHOTO_REQUIRED_CATEGORIES.has(category);
}
