import { api } from "./client";

// (학생, 운영자 공통) 조회하는 기자재 모델 목록 API
export function getEquipmentModels({ page = 0, size = 20, categoryId, keyword } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  // 화면 코드에서는 camelCase를 사용하고, snake_case 이름으로 변환해 전송
  if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
    params.set("category_id", String(categoryId));
  }

  const normalizedKeyword = keyword?.trim();

  if (normalizedKeyword) { // 검색어가 비어 있으면 생략
    params.set("keyword", normalizedKeyword);
  }

  const queryString = params.toString();
  const path = `/equipment-models?${queryString}`;

  // 반환값은 client가 공통 응답 엔벨로프에서 꺼낸 result
  // 목록 응답에는 content, page, size, totalElements, totalPages가 들어옴
  return api.get(path);
}

// 임시 찜 목록 API 경로
export function getMyWishlistedEquipmentModels({ page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return api.get(`/users/me/wishlists/equipment-models?${params.toString()}`);
}







const EQUIPMENT_ITEM_STATUSES = [
  "available",
  "rented",
  "broken",
  "disposalScheduled",
];

const MOCK_STATUS_NOTES = {
  available: "비밀번호:1234\n디스플레이 깨짐.",
  rented: "현재 대여 중인 기기",
  broken: "디스플레이 점검 필요",
  disposalScheduled: "폐기 예정 기기",
};

const MOCK_MODEL_DEFINITIONS = [
  {
    modelId: "mock-equipment-001",
    name: "HP Elite x360 1040 G10 2-in-1",
    labelPrefix: "TA",
    itemCount: 40,
  },
  {
    modelId: "mock-equipment-002",
    name: "화면 확인용 긴 기자재명과 말줄임을 확인하는 노트북 B",
    labelPrefix: "TB",
    itemCount: 14,
  },
  {
    modelId: "mock-equipment-003",
    name: "화면 확인용 태블릿 A",
    labelPrefix: "TC",
    itemCount: 8,
  },
  {
    modelId: "mock-equipment-004",
    name: "화면 확인용 태블릿 B",
    labelPrefix: "TD",
    itemCount: 7,
  },
  {
    modelId: "mock-equipment-005",
    name: "화면 확인용 키보드/마우스 A",
    labelPrefix: "TE",
    itemCount: 6,
  },
  {
    modelId: "mock-equipment-006",
    name: "화면 확인용 키보드/마우스 B",
    labelPrefix: "TF",
    itemCount: 5,
  },
  {
    modelId: "mock-equipment-007",
    name: "화면 확인용 보조배터리 A",
    labelPrefix: "TG",
    itemCount: 8,
  },
  {
    modelId: "mock-equipment-008",
    name: "화면 확인용 보조배터리 B",
    labelPrefix: "TH",
    itemCount: 4,
  },
  {
    modelId: "mock-equipment-009",
    name: "화면 확인용 노트북 거치대 A",
    labelPrefix: "TI",
    itemCount: 2,
  },
  {
    modelId: "mock-equipment-010",
    name: "화면 확인용 노트북 거치대 B",
    labelPrefix: "TJ",
    itemCount: 2,
  },
  {
    modelId: "mock-equipment-011",
    name: "화면 확인용 독서대 A",
    labelPrefix: "TK",
    itemCount: 2,
  },
  {
    modelId: "mock-equipment-012",
    name: "화면 확인용 독서대 B",
    labelPrefix: "TL",
    itemCount: 1,
  },
]
  ;

function createMockEquipmentItems({ itemCount, labelPrefix, modelId }) {
  return Array.from({ length: itemCount }, (_, index) => {
    const status =
      EQUIPMENT_ITEM_STATUSES[index % EQUIPMENT_ITEM_STATUSES.length];

    const displayNumber = String(index + 1).padStart(3, "0");

    return {
      itemId: `${modelId}-item-${displayNumber}`,
      modelId,
      assetNumber: String(index + 1).padStart(7, "0"),
      labelNumber: `${labelPrefix}-${displayNumber}`,
      status,
      notes: MOCK_STATUS_NOTES[status],
    };
  });
}

// 화면 확인용 임시 데이터
// 실제 서버 응답 구조와 상태 코드를 의미하지 않음
const MOCK_EQUIPMENT_MODELS = Object.fromEntries(
  MOCK_MODEL_DEFINITIONS.map((definition) => [
    definition.modelId,
    {
      modelId: definition.modelId,
      name: definition.name,
      labelPrefix: definition.labelPrefix,
      items: createMockEquipmentItems(definition),
    },
  ]),
);

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeSearch(value) {
  return normalizeText(value).toLowerCase();
}

function getMockEquipmentModel(modelId) {
  const equipmentModel = MOCK_EQUIPMENT_MODELS[modelId];

  if (!equipmentModel) {
    throw new Error("기자재 모델을 찾을 수 없습니다.");
  }

  return equipmentModel;
}

function createMutationError(message, code) {
  const error = new Error(message);

  error.code = code;

  return error;
}

function assertSupportedStatus(status) {
  if (!EQUIPMENT_ITEM_STATUSES.includes(status)) {
    throw createMutationError(
      "선택한 기기 상태를 확인할 수 없습니다.",
      "INVALID_STATUS",
    );
  }
}

function assertDigitText(value, fieldName) {
  const normalizedValue = normalizeText(value);

  if (!/^\d+$/.test(normalizedValue)) {
    throw createMutationError(
      `${fieldName}는 숫자로 입력해 주세요.`,
      "INVALID_NUMBER",
    );
  }

  return normalizedValue;
}

function createSequentialNumber(startValue, offset) {
  const width = startValue.length;
  const nextValue = Number(startValue) + offset;

  return String(nextValue).padStart(width, "0");
}

// 서버 응답 변환
// 실제 연동 시 확정된 DTO와 상태 코드 기준으로 교체
function toEquipmentItemListItem(item) {
  return {
    itemId: item.itemId,
    modelId: item.modelId,
    assetNumber: item.assetNumber,
    labelNumber: item.labelNumber,
    status: item.status,
    notes: item.notes,
  };
}

// 실제 API 교체 지점
export async function getAdminEquipmentModelSummary(modelId) {
  const equipmentModel = getMockEquipmentModel(modelId);

  return {
    modelId: equipmentModel.modelId,
    name: equipmentModel.name,
    labelPrefix: equipmentModel.labelPrefix,
  };
}

// 실제 API 교체 지점
// page는 0부터 시작하는 화면 확인용 임시 계약
export async function getAdminEquipmentItems({
  modelId,
  page = 0,
  size = 10,
  keyword = "",
  status = "all",
} = {}) {
  const equipmentModel = getMockEquipmentModel(modelId);

  const requestedPage = Number.isInteger(page) && page >= 0 ? page : 0;

  const resolvedSize = Number.isInteger(size) && size > 0 ? size : 10;

  const normalizedKeyword = normalizeSearch(keyword);

  const filteredItems = equipmentModel.items.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;

    const matchesKeyword =
      normalizedKeyword === "" ||
      normalizeSearch(item.assetNumber).includes(normalizedKeyword) ||
      normalizeSearch(item.labelNumber).includes(normalizedKeyword);

    return matchesStatus && matchesKeyword;
  });

  const totalElements = filteredItems.length;
  const totalPages = Math.ceil(totalElements / resolvedSize);

  const resolvedPage = Math.min(requestedPage, Math.max(0, totalPages - 1));

  const startIndex = resolvedPage * resolvedSize;

  const content = filteredItems
    .slice(startIndex, startIndex + resolvedSize)
    .map(toEquipmentItemListItem);

  return {
    content,
    page: resolvedPage,
    size: resolvedSize,
    totalElements,
    totalPages,
  };
}

// 검색어·현재 페이지와 무관한 모델 전체 기준 개수
export async function getAdminEquipmentItemCounts(modelId) {
  const equipmentModel = getMockEquipmentModel(modelId);

  const counts = {
    all: equipmentModel.items.length,
    available: 0,
    rented: 0,
    broken: 0,
    disposalScheduled: 0,
  };

  for (const item of equipmentModel.items) {
    if (Object.hasOwn(counts, item.status)) {
      counts[item.status] += 1;
    }
  }

  return counts;
}

// 실제 API 교체 지점
// 화면 확인용 임시 변경 Promise이며 목록 원본은 변경하지 않음
export async function createAdminEquipmentItems({
  assetNumberStart,
  labelPrefix,
  labelStart,
  modelId,
  notes = "",
  quantity,
  status,
}) {
  const equipmentModel = getMockEquipmentModel(modelId);

  assertSupportedStatus(status);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw createMutationError(
      "등록할 수량을 확인해 주세요.",
      "INVALID_QUANTITY",
    );
  }

  const resolvedLabelPrefix =
    normalizeText(labelPrefix) || equipmentModel.labelPrefix;

  const resolvedLabelStart = assertDigitText(labelStart, "라벨 시작 번호");

  const resolvedAssetNumberStart = assertDigitText(
    assetNumberStart,
    "비품 번호 시작 번호",
  );

  const generatedItems = Array.from({ length: quantity }, (_, index) => {
    const labelSuffix = createSequentialNumber(resolvedLabelStart, index);

    const assetNumber = createSequentialNumber(resolvedAssetNumberStart, index);

    return {
      labelNumber: `${resolvedLabelPrefix}-${labelSuffix}`,
      assetNumber,
    };
  });

  const duplicatedLabel = generatedItems.find((candidate) =>
    equipmentModel.items.some(
      (item) =>
        normalizeSearch(item.labelNumber) ===
        normalizeSearch(candidate.labelNumber),
    ),
  );

  if (duplicatedLabel) {
    throw createMutationError(
      `${duplicatedLabel.labelNumber} 라벨 번호가 이미 존재합니다.`,
      "DUPLICATED_LABEL_NUMBER",
    );
  }

  const duplicatedAssetNumber = generatedItems.find((candidate) =>
    equipmentModel.items.some(
      (item) => item.assetNumber === candidate.assetNumber,
    ),
  );

  if (duplicatedAssetNumber) {
    throw createMutationError(
      `${duplicatedAssetNumber.assetNumber} 비품 번호가 이미 존재합니다.`,
      "DUPLICATED_ASSET_NUMBER",
    );
  }

  const firstItem = generatedItems[0];
  const lastItem = generatedItems[generatedItems.length - 1];

  return {
    modelId,
    quantity,
    status,
    notes: normalizeText(notes),
    labelStart: firstItem.labelNumber,
    labelEnd: lastItem.labelNumber,
    assetNumberStart: firstItem.assetNumber,
    assetNumberEnd: lastItem.assetNumber,
  };
}

// 실제 API 교체 지점
// 화면 확인용 임시 변경 Promise이며 목록 원본은 변경하지 않음
export async function updateAdminEquipmentItem({
  assetNumber,
  itemId,
  labelNumber,
  modelId,
  notes = "",
  status,
}) {
  const equipmentModel = getMockEquipmentModel(modelId);

  const targetItem = equipmentModel.items.find(
    (item) => item.itemId === itemId,
  );

  if (!targetItem) {
    throw createMutationError(
      "수정할 기기 정보를 찾을 수 없습니다.",
      "ITEM_NOT_FOUND",
    );
  }

  assertSupportedStatus(status);

  const resolvedLabelNumber = normalizeText(labelNumber);
  const resolvedAssetNumber = assertDigitText(assetNumber, "비품 번호");

  if (!resolvedLabelNumber) {
    throw createMutationError(
      "라벨 번호를 입력해 주세요.",
      "INVALID_LABEL_NUMBER",
    );
  }

  const hasDuplicatedLabel = equipmentModel.items.some(
    (item) =>
      item.itemId !== itemId &&
      normalizeSearch(item.labelNumber) ===
      normalizeSearch(resolvedLabelNumber),
  );

  if (hasDuplicatedLabel) {
    throw createMutationError(
      `${resolvedLabelNumber} 라벨 번호가 이미 존재합니다.`,
      "DUPLICATED_LABEL_NUMBER",
    );
  }

  const hasDuplicatedAssetNumber = equipmentModel.items.some(
    (item) =>
      item.itemId !== itemId && item.assetNumber === resolvedAssetNumber,
  );

  if (hasDuplicatedAssetNumber) {
    throw createMutationError(
      `${resolvedAssetNumber} 비품 번호가 이미 존재합니다.`,
      "DUPLICATED_ASSET_NUMBER",
    );
  }

  return {
    itemId,
    modelId,
    assetNumber: resolvedAssetNumber,
    labelNumber: resolvedLabelNumber,
    status,
    notes: normalizeText(notes),
  };
}

// 실제 API 교체 지점
// 대여 중 폐기 불가 규칙은 실패 모달 확인용 임시 규칙
export async function disposeAdminEquipmentItem({ itemId, modelId }) {
  const equipmentModel = getMockEquipmentModel(modelId);

  const targetItem = equipmentModel.items.find(
    (item) => item.itemId === itemId,
  );

  if (!targetItem) {
    throw createMutationError(
      "폐기할 기기 정보를 찾을 수 없습니다.",
      "ITEM_NOT_FOUND",
    );
  }

  if (targetItem.status === "rented") {
    throw createMutationError(
      "대여 중인 기기는 폐기할 수 없습니다.",
      "ITEM_IS_RENTED",
    );
  }

  return {
    itemId: targetItem.itemId,
    modelId: targetItem.modelId,
    assetNumber: targetItem.assetNumber,
  };
}
