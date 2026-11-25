import { api, ApiError } from "./client";

export const categoryKeys = {
  all: ["categories"],
  list: () => ["categories", "list"],
};

// 전체 탭은 서버 카테고리가 아닌 화면 전용 선택지임.
export const ALL_CATEGORY_OPTION = Object.freeze({
  key: "all",
  value: "all",
  label: "전체",
  categoryId: null,
});

// ID와 key는 MSW 기자재 데이터 정합성을 위한 mock 전용 값임.
export const MOCK_EQUIPMENT_CATEGORIES = Object.freeze([
  { key: "laptop", value: "laptop", label: "노트북", categoryId: 1 },
  { key: "tablet", value: "tablet", label: "태블릿", categoryId: 2 },
  { key: "power-bank", value: "power-bank", label: "보조배터리", categoryId: 3 },
  { key: "others", value: "others", label: "기타", categoryId: 4 },
]);

function normalizeCategory(category) {
  return {
    categoryId: category?.categoryId,
    name: category?.name ?? "",
  };
}

export async function fetchCategories(options) {
  const result = await api.get("/categories", options);

  if (!Array.isArray(result)) {
    throw new ApiError({
      status: null,
      code: "INVALID_CATEGORIES_RESPONSE",
      message: "카테고리 응답 형식이 올바르지 않습니다.",
      data: result,
      errorType: "CONTRACT_ERROR",
    });
  }

  return result.map(normalizeCategory);
}

export function toCategoryOption(category, { useMockKey = false } = {}) {
  const mockCategory = useMockKey
    ? MOCK_EQUIPMENT_CATEGORIES.find(
      (candidate) =>
        String(candidate.categoryId) === String(category.categoryId),
    )
    : null;
  const key = mockCategory?.key ?? `category-${String(category.categoryId)}`;

  return {
    key,
    value: key,
    label: category.name,
    categoryId: category.categoryId,
  };
}
