import { api } from "./client";

export const categoryKeys = {
  all: ["categories"],
  list: () => ["categories", "list"],
};

// 전체 탭은 서버 카테고리가 아니라 화면에서만 쓰는 선택지야.
export const ALL_CATEGORY_OPTION = Object.freeze({
  key: "all",
  value: "all",
  label: "전체",
  categoryId: null,
});

// 이 ID와 key는 MSW 기자재 데이터끼리 맞추기 위한 mock 전용 값이야.
export const MOCK_EQUIPMENT_CATEGORIES = Object.freeze([
  { key: "laptop", value: "laptop", label: "노트북", categoryId: 1 },
  { key: "power-bank", value: "power-bank", label: "보조배터리", categoryId: 2 },
  { key: "tablet", value: "tablet", label: "태블릿", categoryId: 3 },
  { key: "keyboard-mouse", value: "keyboard-mouse", label: "키보드/마우스", categoryId: 4 },
  { key: "laptop-stand", value: "laptop-stand", label: "노트북 거치대", categoryId: 5 },
  { key: "book-stand", value: "book-stand", label: "독서대", categoryId: 6 },
]);

function normalizeCategory(category) {
  return {
    categoryId: category?.categoryId,
    name: category?.name ?? "",
  };
}

export async function fetchCategories(options) {
  const result = await api.get("/categories", options);

  return Array.isArray(result) ? result.map(normalizeCategory) : [];
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
