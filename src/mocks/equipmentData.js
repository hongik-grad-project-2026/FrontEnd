import { equipmentModels as studentEquipmentModels } from "./db";

// 학생 목록·찜과 관리자 모델·개별 기자재는 현재 서로 다른 mock 저장소를 사용함.
// 실제 서버 계약이 아니며 API 제공 시 equipmentApi 함수에서 함께 교체함.

// 상태값은 화면 동작 확인을 위한 mock 전용 계약임.
export const MOCK_EQUIPMENT_MODEL_STATUSES = Object.freeze([
  "active",
  "paused",
]);

export const MOCK_EQUIPMENT_ITEM_STATUSES = Object.freeze([
  "available",
  "rented",
  "broken",
  "disposalScheduled",
]);

const MOCK_STATUS_NOTES = {
  available: "비밀번호:1234\n디스플레이 깨짐.",
  rented: "현재 대여 중인 기기",
  broken: "디스플레이 점검 필요",
  disposalScheduled: "폐기 예정 기기",
};

// categoryId와 categoryKey는 src/api/categories.js의 mock 카테고리 정의와 일치시킴.
const MOCK_MODEL_DEFINITIONS = [
  {
    modelId: "mock-equipment-001",
    name: "화면 확인용 노트북 A",
    modelName: "MOCK-LAPTOP-A",
    categoryId: 1,
    categoryKey: "laptop",
    rentalPolicies: ["regular"],
    os: "Windows",
    accessories: "본체, 파우치, 충전 케이블",
    specification: "화면 확인용 성능 정보",
    description: "일반적인 두 줄 설명의 배치를 확인합니다.",
    status: "active",
    receivedDate: "2026.08.01",
    disposalDate: "2028.08.01",
    labelPrefix: "TA",
    itemCount: 5,
    availableCount: 3,
  },
  {
    modelId: "mock-equipment-002",
    name: "화면 확인용 긴 기자재명과 말줄임을 확인하는 노트북 B",
    modelName: "MOCK-LAPTOP-B-LONG-MODEL-NAME",
    categoryId: 1,
    categoryKey: "laptop",
    rentalPolicies: ["regular", "always"],
    os: "macOS",
    accessories: "본체, 보호 케이스, 파우치, 어댑터, 충전 케이블",
    specification: "긴 성능 정보가 두 줄을 초과할 때 표시를 확인합니다.",
    description:
      "긴 설명이 셀 너비와 행 높이를 넘지 않도록 두 줄 말줄임을 확인하는 임시 내용입니다.",
    status: "paused",
    receivedDate: "2026.08.02",
    disposalDate: "2028.08.02",
    labelPrefix: "TB",
    itemCount: 4,
    availableCount: 0,
  },
  {
    modelId: "mock-equipment-003",
    name: "화면 확인용 태블릿 A",
    modelName: "MOCK-TABLET-A",
    categoryId: 2,
    categoryKey: "tablet",
    rentalPolicies: ["always"],
    os: "Android",
    accessories: "본체, 케이스, 충전 케이블",
    specification: "화면 확인용 성능 정보",
    description: "카테고리와 OS의 두 줄 표시를 확인합니다.",
    status: "active",
    receivedDate: "2026.08.03",
    disposalDate: "2028.08.03",
    labelPrefix: "TC",
    itemCount: 3,
    availableCount: 2,
  },
  {
    modelId: "mock-equipment-004",
    name: "화면 확인용 태블릿 B",
    modelName: "MOCK-TABLET-B",
    categoryId: 2,
    categoryKey: "tablet",
    rentalPolicies: ["regular"],
    os: "iPadOS",
    accessories: "본체, 케이스",
    specification: "",
    description: "성능 정보가 없는 셀의 배치를 확인합니다.",
    status: "paused",
    receivedDate: "2026.08.04",
    disposalDate: "2028.08.04",
    labelPrefix: "TD",
    itemCount: 2,
    availableCount: 0,
  },
  {
    modelId: "mock-equipment-005",
    name: "화면 확인용 키보드/마우스 A",
    modelName: "",
    categoryId: 4,
    categoryKey: "others",
    rentalPolicies: ["always"],
    os: "",
    accessories: "키보드, 마우스",
    specification: "",
    description: "모델명과 OS가 없는 한 줄 표시를 확인합니다.",
    status: "active",
    receivedDate: "2026.08.05",
    disposalDate: "2028.08.05",
    labelPrefix: "TE",
    itemCount: 6,
    availableCount: 4,
  },
  {
    modelId: "mock-equipment-006",
    name: "화면 확인용 키보드/마우스 B",
    modelName: "MOCK-INPUT-B",
    categoryId: 4,
    categoryKey: "others",
    rentalPolicies: ["always"],
    os: "",
    accessories: "키보드, 마우스, 수신기",
    specification: "화면 확인용 연결 정보",
    description: "대여중지 배지의 표시를 확인합니다.",
    status: "paused",
    receivedDate: "2026.08.06",
    disposalDate: "2028.08.06",
    labelPrefix: "TF",
    itemCount: 3,
    availableCount: 0,
  },
  {
    modelId: "mock-equipment-007",
    name: "화면 확인용 보조배터리 A",
    modelName: "MOCK-BATTERY-A",
    categoryId: 3,
    categoryKey: "power-bank",
    rentalPolicies: ["always"],
    os: "",
    accessories: "본체, 충전 케이블",
    specification: "화면 확인용 용량 정보",
    description: "OS 없이 카테고리만 표시합니다.",
    status: "active",
    receivedDate: "2026.08.07",
    disposalDate: "2028.08.07",
    labelPrefix: "TG",
    itemCount: 8,
    availableCount: 5,
  },
  {
    modelId: "mock-equipment-008",
    name: "화면 확인용 보조배터리 B",
    modelName: "MOCK-BATTERY-B",
    categoryId: 3,
    categoryKey: "power-bank",
    rentalPolicies: ["always"],
    os: "",
    accessories: "본체, 파우치, 충전 케이블",
    specification: "화면 확인용 용량 정보",
    description: "",
    status: "paused",
    receivedDate: "2026.08.08",
    disposalDate: "2028.08.08",
    labelPrefix: "TH",
    itemCount: 4,
    availableCount: 0,
  },
  {
    modelId: "mock-equipment-009",
    name: "화면 확인용 노트북 거치대 A",
    modelName: "MOCK-LAPTOP-STAND-A",
    categoryId: 4,
    categoryKey: "others",
    rentalPolicies: ["always"],
    os: "",
    accessories: "거치대, 보관 파우치",
    specification: "",
    description: "거치대 카테고리의 목록을 확인합니다.",
    status: "active",
    receivedDate: "2026.08.09",
    disposalDate: "2028.08.09",
    labelPrefix: "TI",
    itemCount: 2,
    availableCount: 2,
  },
  {
    modelId: "mock-equipment-010",
    name: "화면 확인용 노트북 거치대 B",
    modelName: "MOCK-LAPTOP-STAND-B",
    categoryId: 4,
    categoryKey: "others",
    rentalPolicies: ["always"],
    os: "",
    accessories: "거치대",
    specification: "",
    description: "첫 페이지의 마지막 행을 확인합니다.",
    status: "paused",
    receivedDate: "2026.08.10",
    disposalDate: "2028.08.10",
    labelPrefix: "TJ",
    itemCount: 2,
    availableCount: 0,
  },
  {
    modelId: "mock-equipment-011",
    name: "화면 확인용 독서대 A",
    modelName: "MOCK-BOOK-STAND-A",
    categoryId: 4,
    categoryKey: "others",
    rentalPolicies: ["always"],
    os: "",
    accessories: "독서대",
    specification: "",
    description: "두 번째 페이지의 목록을 확인합니다.",
    status: "active",
    receivedDate: "2026.08.11",
    disposalDate: "2028.08.11",
    labelPrefix: "TK",
    itemCount: 2,
    availableCount: 1,
  },
  {
    modelId: "mock-equipment-012",
    name: "화면 확인용 독서대 B",
    modelName: "MOCK-BOOK-STAND-B",
    categoryId: 4,
    categoryKey: "others",
    rentalPolicies: ["always"],
    os: "",
    accessories: "독서대, 보관 가방",
    specification: "",
    description: "마지막 페이지와 대여중지 상태를 확인합니다.",
    status: "paused",
    receivedDate: "2026.08.12",
    disposalDate: "2028.08.12",
    labelPrefix: "TL",
    itemCount: 1,
    availableCount: 0,
  },
];

let nextModelSequence = MOCK_MODEL_DEFINITIONS.length + 1;
let nextItemSequence = 1;

const mockAdminEquipmentModels = MOCK_MODEL_DEFINITIONS.map(
  ({ availableCount, itemCount, ...model }) => ({ ...model }),
);

const mockEquipmentItems = new Map(
  MOCK_MODEL_DEFINITIONS.map((definition) => [
    definition.modelId,
    Array.from({ length: definition.itemCount }, (_, index) => {
      const status =
        index < definition.availableCount
          ? "available"
          : MOCK_EQUIPMENT_ITEM_STATUSES[
          (index % (MOCK_EQUIPMENT_ITEM_STATUSES.length - 1)) + 1
          ];
      const displayNumber = String(index + 1).padStart(3, "0");

      return {
        itemId: `${definition.modelId}-item-${displayNumber}`,
        modelId: definition.modelId,
        assetNumber: String(index + 1).padStart(7, "0"),
        labelNumber: `${definition.labelPrefix}-${displayNumber}`,
        status,
        notes: MOCK_STATUS_NOTES[status],
      };
    }),
  ]),
);

function createMockError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeSearch(value) {
  return normalizeText(value).toLowerCase();
}

function clone(value) {
  return structuredClone(value);
}

function waitForMock(signal, delay = 120) {
  if (signal?.aborted) {
    return Promise.reject(new DOMException("요청이 취소됐어.", "AbortError"));
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, delay);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeoutId);
        reject(new DOMException("요청이 취소됐어.", "AbortError"));
      },
      { once: true },
    );
  });
}

function toPage(items, page, size, extra = {}) {
  const requestedPage = Number.isInteger(page) && page >= 0 ? page : 0;
  const resolvedSize = Number.isInteger(size) && size > 0 ? size : 10;
  const totalElements = items.length;
  const totalPages = Math.ceil(totalElements / resolvedSize);
  const resolvedPage = Math.min(requestedPage, Math.max(0, totalPages - 1));
  const startIndex = resolvedPage * resolvedSize;

  return {
    content: clone(items.slice(startIndex, startIndex + resolvedSize)),
    page: resolvedPage,
    size: resolvedSize,
    totalElements,
    totalPages,
    hasNext: resolvedPage + 1 < totalPages,
    ...extra,
  };
}

function getAdminModel(modelId) {
  const model = mockAdminEquipmentModels.find(
    (candidate) => candidate.modelId === String(modelId),
  );

  if (!model) {
    throw createMockError("기자재 모델을 찾을 수 없습니다.", "MODEL_NOT_FOUND");
  }

  return model;
}

function getItems(modelId) {
  getAdminModel(modelId);
  return mockEquipmentItems.get(String(modelId)) ?? [];
}

function getStockText(modelId) {
  const items = getItems(modelId);
  const availableCount = items.filter(
    (item) => item.status === "available",
  ).length;
  return `${availableCount} / ${items.length}`;
}

function toAdminModel(model) {
  return {
    ...clone(model),
    stockText: getStockText(model.modelId),
  };
}

function toStudentModel(model) {
  return {
    modelId: `mock-catalog-model-${model.id}`,
    modelImageUrl: model.modelImageUrl,
    categoryId: model.categoryId,
    rentalPolicies: [...(model.rentalPolicies ?? [])],
    modelName: model.modelName,
    specification: model.specification,
    components: model.components,
    description: model.description,
    stockTotal: model.stockTotal,
    stockRemaining: model.stockRemaining,
    isWish: Boolean(model.isWish),
  };
}

function getStudentModel(modelId) {
  const prefix = "mock-catalog-model-";
  const normalizedId = String(modelId);

  if (!normalizedId.startsWith(prefix)) {
    throw createMockError("기자재 모델을 찾을 수 없습니다.", "MODEL_NOT_FOUND");
  }

  const storedModel = studentEquipmentModels.find(
    (model) => String(model.id) === normalizedId.slice(prefix.length),
  );

  if (!storedModel) {
    throw createMockError("기자재 모델을 찾을 수 없습니다.", "MODEL_NOT_FOUND");
  }

  return storedModel;
}

function assertModelStatus(status) {
  if (!MOCK_EQUIPMENT_MODEL_STATUSES.includes(status)) {
    throw createMockError(
      "기자재 상태를 확인할 수 없습니다.",
      "INVALID_STATUS",
    );
  }
}

function assertItemStatus(status) {
  if (!MOCK_EQUIPMENT_ITEM_STATUSES.includes(status)) {
    throw createMockError("기기 상태를 확인할 수 없습니다.", "INVALID_STATUS");
  }
}

function assertDigitText(value, fieldName) {
  const normalizedValue = normalizeText(value);

  if (!/^\d+$/.test(normalizedValue)) {
    throw createMockError(
      `${fieldName}는 숫자로 입력해 주세요.`,
      "INVALID_NUMBER",
    );
  }

  return normalizedValue;
}

function createSequentialNumber(startValue, offset) {
  return String(Number(startValue) + offset).padStart(startValue.length, "0");
}

export async function queryMockEquipmentModels({
  categoryId,
  keyword = "",
  page = 0,
  size = 20,
  signal,
} = {}) {
  await waitForMock(signal);

  const normalizedKeyword = normalizeSearch(keyword);
  const filteredModels = studentEquipmentModels
    .filter((model) => {
      const matchesCategory =
        categoryId === undefined ||
        categoryId === null ||
        categoryId === "" ||
        String(model.categoryId) === String(categoryId);
      const matchesKeyword =
        !normalizedKeyword ||
        normalizeSearch(model.modelName).includes(normalizedKeyword);

      return matchesCategory && matchesKeyword;
    })
    .map(toStudentModel);

  return toPage(filteredModels, page, size);
}

export async function queryMockWishlistedEquipmentModels({
  page = 0,
  size = 20,
  signal,
} = {}) {
  await waitForMock(signal);

  return toPage(
    studentEquipmentModels.filter((model) => model.isWish).map(toStudentModel),
    page,
    size,
  );
}

export async function updateMockEquipmentWishlist({ modelId, isWish }) {
  await waitForMock();
  const model = getStudentModel(modelId);
  model.isWish = Boolean(isWish);

  return toStudentModel(model);
}

export async function queryMockAdminEquipmentModels({
  categoryId,
  keyword = "",
  page = 0,
  size = 10,
  signal,
} = {}) {
  await waitForMock(signal);

  const normalizedKeyword = normalizeSearch(keyword);
  const filteredModels = mockAdminEquipmentModels.filter((model) => {
    const matchesCategory =
      categoryId === undefined ||
      categoryId === null ||
      categoryId === "" ||
      String(model.categoryId) === String(categoryId);
    const matchesKeyword =
      !normalizedKeyword ||
      [model.name, model.modelName].some((value) =>
        normalizeSearch(value).includes(normalizedKeyword),
      );

    return matchesCategory && matchesKeyword;
  });

  const categoryCounts = mockAdminEquipmentModels.reduce(
    (counts, model) => ({
      ...counts,
      [String(model.categoryId)]: (counts[String(model.categoryId)] ?? 0) + 1,
    }),
    { all: mockAdminEquipmentModels.length },
  );

  return toPage(filteredModels.map(toAdminModel), page, size, {
    categoryCounts,
  });
}

export async function createMockAdminEquipmentModel(values) {
  await waitForMock();
  assertModelStatus(values.status);

  const modelId = `mock-equipment-${String(nextModelSequence).padStart(3, "0")}`;
  nextModelSequence += 1;

  const model = {
    modelId,
    categoryId: values.categoryId,
    categoryKey: values.categoryKey,
    status: values.status,
    rentalPolicies: [...values.rentalPolicies],
    receivedDate: values.receivedDate,
    disposalDate: values.disposalDate,
    name: normalizeText(values.name),
    modelName: normalizeText(values.modelName),
    os: normalizeText(values.os),
    accessories: normalizeText(values.accessories),
    specification: normalizeText(values.specification),
    description: normalizeText(values.description),
    labelPrefix: normalizeText(values.labelPrefix),
  };

  mockAdminEquipmentModels.push(model);
  mockEquipmentItems.set(modelId, []);

  return toAdminModel(model);
}

export async function updateMockAdminEquipmentModel(values) {
  await waitForMock();
  const model = getAdminModel(values.modelId);
  assertModelStatus(values.status);

  Object.assign(model, {
    categoryId: values.categoryId,
    categoryKey: values.categoryKey,
    status: values.status,
    rentalPolicies: [...values.rentalPolicies],
    receivedDate: values.receivedDate,
    disposalDate: values.disposalDate,
    name: normalizeText(values.name),
    modelName: normalizeText(values.modelName),
    os: normalizeText(values.os),
    accessories: normalizeText(values.accessories),
    specification: normalizeText(values.specification),
    description: normalizeText(values.description),
    labelPrefix: normalizeText(values.labelPrefix),
  });

  return toAdminModel(model);
}

export async function disposeMockAdminEquipmentModel({ modelId }) {
  await waitForMock();
  const model = getAdminModel(modelId);
  const items = getItems(modelId);

  if (items.some((item) => item.status !== "available")) {
    throw createMockError(
      "아직 대여 중이거나 폐기할 수 없는 기기가 존재합니다.",
      "MODEL_HAS_UNAVAILABLE_ITEMS",
    );
  }

  mockAdminEquipmentModels.splice(mockAdminEquipmentModels.indexOf(model), 1);
  mockEquipmentItems.delete(String(modelId));

  return { modelId: model.modelId };
}

export async function getMockAdminEquipmentModelSummary(
  modelId,
  { signal } = {},
) {
  await waitForMock(signal);
  const model = getAdminModel(modelId);

  return {
    modelId: model.modelId,
    name: model.name,
    labelPrefix: model.labelPrefix,
  };
}

export async function queryMockAdminEquipmentItems({
  modelId,
  page = 0,
  size = 10,
  keyword = "",
  status = "all",
  signal,
} = {}) {
  await waitForMock(signal);
  const normalizedKeyword = normalizeSearch(keyword);
  const filteredItems = getItems(modelId).filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesKeyword =
      !normalizedKeyword ||
      normalizeSearch(item.assetNumber).includes(normalizedKeyword) ||
      normalizeSearch(item.labelNumber).includes(normalizedKeyword);

    return matchesStatus && matchesKeyword;
  });

  return toPage(filteredItems, page, size);
}

export async function getMockAdminEquipmentItemCounts(
  modelId,
  { signal } = {},
) {
  await waitForMock(signal);
  const items = getItems(modelId);
  const counts = {
    all: items.length,
    available: 0,
    rented: 0,
    broken: 0,
    disposalScheduled: 0,
  };

  items.forEach((item) => {
    if (Object.hasOwn(counts, item.status)) {
      counts[item.status] += 1;
    }
  });

  return counts;
}

export async function createMockAdminEquipmentItems({
  // assetNumberStart,
  labelPrefix,
  labelStart,
  modelId,
  notes = "",
  quantity,
  status,
}) {
  await waitForMock();
  const items = getItems(modelId);
  assertItemStatus(status);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw createMockError("등록할 수량을 확인해 주세요.", "INVALID_QUANTITY");
  }

  const resolvedLabelPrefix = normalizeText(labelPrefix);
  const resolvedLabelStart = assertDigitText(labelStart, "라벨 시작 번호");
  // const resolvedAssetNumberStart = assertDigitText(
  //   assetNumberStart,
  //   "비품 번호 시작 번호",
  // );

  const generatedItems = Array.from({ length: quantity }, (_, index) => {
    const labelSuffix = createSequentialNumber(resolvedLabelStart, index);
    // const assetNumber = createSequentialNumber(resolvedAssetNumberStart, index);

    return {
      itemId: `${modelId}-created-${nextItemSequence++}`,
      modelId,
      labelNumber: `${resolvedLabelPrefix}-${labelSuffix}`,
      // assetNumber,
      status,
      notes: normalizeText(notes),
    };
  });

  const duplicatedLabel = generatedItems.find((candidate) =>
    items.some(
      (item) =>
        normalizeSearch(item.labelNumber) ===
        normalizeSearch(candidate.labelNumber),
    ),
  );
  // const duplicatedAssetNumber = generatedItems.find((candidate) =>
  //   items.some((item) => item.assetNumber === candidate.assetNumber),
  // );

  if (duplicatedLabel) {
    throw createMockError(
      `${duplicatedLabel.labelNumber} 라벨 번호가 이미 존재합니다.`,
      "DUPLICATED_LABEL_NUMBER",
    );
  }

  // if (duplicatedAssetNumber) {
  //   throw createMockError(
  //     `${duplicatedAssetNumber.assetNumber} 비품 번호가 이미 존재합니다.`,
  //     "DUPLICATED_ASSET_NUMBER",
  //   );
  // }

  items.push(...generatedItems);
  const firstItem = generatedItems[0];
  const lastItem = generatedItems.at(-1);

  return {
    modelId,
    quantity,
    status,
    labelStart: firstItem.labelNumber,
    labelEnd: lastItem.labelNumber,
    // assetNumberStart: firstItem.assetNumber,
    // assetNumberEnd: lastItem.assetNumber,
  };
}

export async function updateMockAdminEquipmentItem(values) {
  await waitForMock();
  const items = getItems(values.modelId);
  const targetItem = items.find((item) => item.itemId === values.itemId);

  if (!targetItem) {
    throw createMockError(
      "수정할 기기 정보를 찾을 수 없습니다.",
      "ITEM_NOT_FOUND",
    );
  }

  assertItemStatus(values.status);
  const labelNumber = normalizeText(values.labelNumber);
  const assetNumber = assertDigitText(values.assetNumber, "비품 번호");

  if (!labelNumber) {
    throw createMockError("라벨 번호를 입력해 주세요.", "INVALID_LABEL_NUMBER");
  }

  if (
    items.some(
      (item) =>
        item.itemId !== values.itemId &&
        normalizeSearch(item.labelNumber) === normalizeSearch(labelNumber),
    )
  ) {
    throw createMockError(
      `${labelNumber} 라벨 번호가 이미 존재합니다.`,
      "DUPLICATED_LABEL_NUMBER",
    );
  }

  if (
    items.some(
      (item) =>
        item.itemId !== values.itemId && item.assetNumber === assetNumber,
    )
  ) {
    throw createMockError(
      `${assetNumber} 비품 번호가 이미 존재합니다.`,
      "DUPLICATED_ASSET_NUMBER",
    );
  }

  Object.assign(targetItem, {
    assetNumber,
    labelNumber,
    status: values.status,
    notes: normalizeText(values.notes),
  });

  return clone(targetItem);
}

export async function disposeMockAdminEquipmentItem({ itemId, modelId }) {
  await waitForMock();
  const items = getItems(modelId);
  const targetIndex = items.findIndex((item) => item.itemId === itemId);

  if (targetIndex < 0) {
    throw createMockError(
      "폐기할 기기 정보를 찾을 수 없습니다.",
      "ITEM_NOT_FOUND",
    );
  }

  if (items[targetIndex].status === "rented") {
    throw createMockError(
      "대여 중인 기기는 폐기할 수 없습니다.",
      "ITEM_IS_RENTED",
    );
  }

  const [disposedItem] = items.splice(targetIndex, 1);
  return clone(disposedItem);
}
