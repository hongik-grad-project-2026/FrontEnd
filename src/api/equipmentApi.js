import { api, ApiError, isMockMode } from "./client";
import {
  createMockAdminEquipmentItems,
  createMockAdminEquipmentModel,
  disposeMockAdminEquipmentItem,
  disposeMockAdminEquipmentModel,
  getMockAdminEquipmentItemCounts,
  getMockAdminEquipmentModelSummary,
  queryMockAdminEquipmentItems,
  queryMockAdminEquipmentModels,
  queryMockEquipmentModels,
  queryMockWishlistedEquipmentModels,
  updateMockAdminEquipmentItem,
  updateMockAdminEquipmentModel,
  updateMockEquipmentWishlist,
} from "../mocks/equipmentData";


// 기기 상태 정의이며 상태 변경 시 이 배열만 수정함.
// server는 서버 값, key는 화면 키, label은 화면 표시 문구임.
const ITEM_STATUS_DEFS = [
  { server: "AVAILABLE", key: "available", label: "대여 가능" },
  { server: "RESERVED", key: "reserved", label: "신청됨" },
  { server: "RENTED", key: "rented", label: "대여중" },
  { server: "BROKEN", key: "broken", label: "고장" },
];

// 서버 값을 화면 키로 변환함.
export const ITEM_STATUS = Object.freeze(
  Object.fromEntries(ITEM_STATUS_DEFS.map((def) => [def.server, def.key])),
);

// 화면 키를 한글 라벨로 변환함.
export const ITEM_STATUS_LABEL = Object.freeze(
  Object.fromEntries(ITEM_STATUS_DEFS.map((def) => [def.key, def.label])),
);

// 화면 키를 서버 쿼리 값으로 변환함.
const ITEM_STATUS_REQUEST = Object.freeze(
  Object.fromEntries(ITEM_STATUS_DEFS.map((def) => [def.key, def.server])),
);

function normalizeListParams(params = {}) {
  return {
    categoryId: params.categoryId ?? null,
    keyword: params.keyword?.trim() ?? "",
    page: params.page ?? 0,
    size: params.size ?? 20,
  };
}

function normalizeItemParams(params = {}) {
  return {
    modelId: params.modelId ?? null,
    status: params.status ?? "all",
    keyword: params.keyword?.trim() ?? "",
    page: params.page ?? 0,
    size: params.size ?? 10,
  };
}

function createEquipmentListContractError(message, data) {
  return new ApiError({
    status: null,
    code: "INVALID_EQUIPMENT_MODEL_LIST_RESPONSE",
    message,
    data,
    errorType: "CONTRACT_ERROR",
  });
}

function createEquipmentItemListContractError(message, data) {
  return new ApiError({
    status: null,
    code: "INVALID_EQUIPMENT_ITEM_LIST_RESPONSE",
    message,
    data,
    errorType: "CONTRACT_ERROR",
  });
}

function createEquipmentModelDetailContractError(message, data) {
  return new ApiError({
    status: null,
    code: "INVALID_EQUIPMENT_MODEL_DETAIL_RESPONSE",
    message,
    data,
    errorType: "CONTRACT_ERROR",
  });
}

function normalizeRequestedModelId(modelId) {
  const normalizedModelId =
    typeof modelId === "number"
      ? modelId
      : typeof modelId === "string" && modelId.trim()
        ? Number(modelId)
        : Number.NaN;

  if (
    !Number.isFinite(normalizedModelId) ||
    !Number.isInteger(normalizedModelId) ||
    normalizedModelId <= 0
  ) {
    throw new ApiError({
      status: null,
      code: "INVALID_EQUIPMENT_MODEL_ID",
      message: "기자재 모델 ID는 양의 정수여야 합니다.",
      data: { modelId },
      errorType: "VALIDATION_ERROR",
    });
  }

  return normalizedModelId;
}

function normalizeRequiredInteger(value, fieldName, result, where = "기자재 목록") {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && !value.trim())
  ) {
    if (where === "기기 목록") {
      throw createEquipmentItemListContractError(
        `${where}의 ${fieldName} 값이 누락되었습니다.`,
        result,
      );
    } else {
      throw createEquipmentListContractError(
        `${where}의 ${fieldName} 값이 누락되었습니다.`,
        result,
      );
    }
  }

  const normalizedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (
    !Number.isFinite(normalizedValue) ||
    !Number.isInteger(normalizedValue) ||
    normalizedValue < 0
  ) {
    if (where === "기기 목록") {
      throw createEquipmentItemListContractError(
        `${where}의 ${fieldName} 값이 올바르지 않습니다.`,
        result,
      );
    } else {
      throw createEquipmentListContractError(
        `${where}의 ${fieldName} 값이 올바르지 않습니다.`,
        result,
      );
    }
  }

  return normalizedValue;
}

function normalizeOptionalCount(value) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && !value.trim())
  ) {
    return null;
  }

  const normalizedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(normalizedValue) &&
    Number.isInteger(normalizedValue) &&
    normalizedValue >= 0
    ? normalizedValue
    : null;
}

function normalizeDisplayText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "-";
}

function normalizeOptionalText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeDisplayDate(value) {
  const normalizedValue = normalizeOptionalText(value);

  if (!normalizedValue) {
    return "-";
  }

  const dateMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  return dateMatch ? `${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}` : "-";
}

function normalizeAdminEquipmentModelByID(result, requestedModelId) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw createEquipmentModelDetailContractError(
      "기자재 모델 정보를 확인할 수 없습니다.",
      result,
    );
  }

  const responseModelId =
    typeof result.modelId === "number"
      ? result.modelId
      : typeof result.modelId === "string" && result.modelId.trim()
        ? Number(result.modelId)
        : Number.NaN;

  if (
    !Number.isFinite(responseModelId) ||
    !Number.isInteger(responseModelId) ||
    responseModelId <= 0 ||
    responseModelId !== requestedModelId
  ) {
    throw createEquipmentModelDetailContractError(
      "기자재 모델 식별자가 요청과 일치하지 않습니다.",
      result,
    );
  }

  return {
    modelId: responseModelId,
    name: normalizeDisplayText(result.name),
    labelPrefix: normalizeOptionalText(result.labelPrefix) ?? "",
    nextLabelNumber: normalizeOptionalCount(result.nextLabelNumber),
  };
}

function normalizeAdminEquipmentItems(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw createEquipmentItemListContractError(
      "기자재 항목 목록을 확인할 수 없습니다.",
      result,
    );
  }

  if (!Array.isArray(result.items)) {
    throw createEquipmentItemListContractError(
      "기기 목록 배열이 누락되었습니다.",
      result,
    );
  }

  if (typeof result.hasNext !== "boolean") {
    throw createEquipmentItemListContractError(
      "기기 목록의 다음 페이지 정보가 올바르지 않습니다.",
      result,
    );
  }

  return {
    content: result.items.map((item) =>
      normalizeAdminEquipmentItem(item, result),
    ),
    page: normalizeRequiredInteger(result.page, "page", result, "기기 목록"),
    size: normalizeRequiredInteger(result.size, "size", result, "기기 목록"),
    totalElements: normalizeRequiredInteger(result.totalElements, "totalElements", result, "기기 목록"),
    totalPages: normalizeRequiredInteger(result.totalPages, "totalPages", result, "기기 목록"),
    hasNext: result.hasNext,
    statusCounts: normalizeItemStatusCounts(result.statusCounts),
  }
}

function normalizeAdminEquipmentItem(item, result) {
  if (
    !item ||
    typeof item !== "object" ||
    Array.isArray(item) ||
    item.itemId === undefined ||
    item.itemId === null ||
    (typeof item.itemId === "string" && !item.itemId.trim())
  ) {
    throw createEquipmentItemListContractError(
      "기기 식별자가 누락되었습니다.",
      result,
    );
  }

  const itemId = normalizeRequiredInteger(
    item.itemId,
    "itemId",
    result,
    "기기 목록",
  );

  if (itemId <= 0) {
    throw createEquipmentItemListContractError(
      "기기 식별자가 올바르지 않습니다.",
      result,
    );
  }

  return {
    itemId,
    labelNumber: normalizeDisplayText(item.labelCode),
    status: ITEM_STATUS[item.status] ?? "unknown",
    notes: normalizeDisplayText(item.memo),
  };
}

function normalizeAdminEquipmentModel(model, result) {
  if (
    !model ||
    typeof model !== "object" ||
    Array.isArray(model) ||
    model.modelId === undefined ||
    model.modelId === null ||
    (typeof model.modelId === "string" && !model.modelId.trim())
  ) {
    throw createEquipmentListContractError(
      "기자재 모델 식별자가 누락되었습니다.",
      result,
    );
  }

  const availableCount = normalizeOptionalCount(model.availableCount);
  const totalCount = normalizeOptionalCount(model.totalCount);
  const status =
    model.rentalStatus === "AVAILABLE"
      ? "active"
      : model.rentalStatus === "UNAVAILABLE"
        ? "paused"
        : "unknown";

  return {
    modelId: model.modelId,
    modelImageUrl: normalizeOptionalText(model.modelImageUrl),
    name: normalizeDisplayText(model.name),
    categoryId: model.categoryId ?? null,
    categoryName: normalizeDisplayText(model.categoryName),
    accessories: normalizeDisplayText(model.components),
    specification: normalizeDisplayText(model.specification),
    description: normalizeDisplayText(model.description),
    stockText:
      availableCount === null || totalCount === null
        ? "-"
        : `${availableCount} / ${totalCount}`,
    status,
    receivedDate: normalizeDisplayDate(model.receivedDate),
    disposalDate: normalizeDisplayDate(model.disposalDate),
  };
}

function normalizeItemStatusCounts(statusCounts) {
  const normalizedCounts = normalizeCategoryCounts(statusCounts);
  const counts = {};

  ITEM_STATUS_DEFS.forEach(({ server, key }) => {
    if (Object.hasOwn(normalizedCounts, server)) {
      counts[key] = normalizedCounts[server];
    }
  });

  const explicitAllCount = normalizedCounts.all ?? normalizedCounts.ALL;
  const hasAllDocumentedStatuses = ITEM_STATUS_DEFS.every(({ server }) =>
    Object.hasOwn(normalizedCounts, server),
  );

  if (explicitAllCount !== undefined) {
    counts.all = explicitAllCount;
  } else if (hasAllDocumentedStatuses) {
    // OpenAPI에 정의된 네 상태가 모두 있을 때만 전체 건수를 계산함.
    counts.all = ITEM_STATUS_DEFS.reduce(
      (total, { server }) => total + normalizedCounts[server],
      0,
    );
  }

  return counts;
}

function normalizeCategoryCounts(categoryCounts) {
  if (
    !categoryCounts ||
    typeof categoryCounts !== "object" ||
    Array.isArray(categoryCounts)
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(categoryCounts).flatMap(([key, value]) => {
      const count = normalizeOptionalCount(value);

      return count === null ? [] : [[key, count]];
    }),
  );
}

function normalizeAdminEquipmentModelPage(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw createEquipmentListContractError(
      "기자재 모델 목록 응답 형식이 올바르지 않습니다.",
      result,
    );
  }

  if (!Array.isArray(result.models)) {
    throw createEquipmentListContractError(
      "기자재 모델 목록 배열이 누락되었습니다.",
      result,
    );
  }

  if (typeof result.hasNext !== "boolean") {
    throw createEquipmentListContractError(
      "기자재 목록의 다음 페이지 정보가 올바르지 않습니다.",
      result,
    );
  }

  return {
    content: result.models.map((model) =>
      normalizeAdminEquipmentModel(model, result),
    ),
    page: normalizeRequiredInteger(result.page, "page", result),
    size: normalizeRequiredInteger(result.size, "size", result),
    totalElements: normalizeRequiredInteger(
      result.totalElements,
      "totalElements",
      result,
    ),
    totalPages: normalizeRequiredInteger(
      result.totalPages,
      "totalPages",
      result,
    ),
    hasNext: result.hasNext,
    last: !result.hasNext,
    categoryCounts: normalizeCategoryCounts(result.categoryCounts),
  };
}

function createEquipmentModelContractError(message, data) {
  return new ApiError({
    status: null,
    code: "INVALID_EQUIPMENT_MODEL_CREATE_RESPONSE",
    message,
    data,
    errorType: "CONTRACT_ERROR",
  });
}

function createEquipmentModelImageContractError(message, data) {
  return new ApiError({
    status: null,
    code: "INVALID_EQUIPMENT_MODEL_IMAGE_RESPONSE",
    message,
    data,
    errorType: "CONTRACT_ERROR",
  });
}

function normalizeCreateCategoryId(value) {
  const categoryId =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(categoryId)) {
    throw new Error("등록할 기자재 카테고리를 확인할 수 없습니다.");
  }

  return categoryId;
}

function normalizeCreateDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
      return normalizedValue;
    }

    if (/^\d{4}\.\d{2}\.\d{2}$/.test(normalizedValue)) {
      return normalizedValue.replaceAll(".", "-");
    }
  }

  throw new Error("폐기일 형식을 확인해 주세요.");
}

function createAdminEquipmentModelRequest(values = {}) {
  const prefixCode = values.labelPrefix?.trim() ?? "";
  const modelName = values.name?.trim() ?? "";
  const components = values.accessories?.trim() ?? "";
  const description = values.description?.trim() ?? "";
  const specification = values.specification?.trim() ?? "";
  const rentalStatus =
    values.status === "active"
      ? "AVAILABLE"
      : values.status === "paused"
        ? "UNAVAILABLE"
        : null;

  if (!modelName) {
    throw new Error("모델명을 입력해 주세요.");
  }

  if (modelName.length > 100) {
    throw new Error("모델명은 100자 이하로 입력해 주세요.");
  }

  if (!components) {
    throw new Error("구성품을 입력해 주세요.");
  }

  if (prefixCode.length > 10) {
    throw new Error("라벨 번호 접두사는 10자 이하로 입력해 주세요.");
  }

  if (!rentalStatus) {
    throw new Error("대여 상태를 확인해 주세요.");
  }

  return {
    categoryId: normalizeCreateCategoryId(values.categoryId),
    ...(prefixCode && { prefixCode }),
    modelName,
    components,
    ...(description && { description }),
    ...(specification && { specification }),
    rentalStatus,
    disposalDate: normalizeCreateDate(values.disposalDate),
  };
}

function normalizeCreatedEquipmentModel(result) {
  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result) ||
    typeof result.modelId !== "number" ||
    !Number.isInteger(result.modelId)
  ) {
    throw createEquipmentModelContractError(
      "등록된 기자재 모델 식별자를 확인할 수 없습니다.",
      result,
    );
  }

  return { modelId: result.modelId };
}

function normalizeUploadedEquipmentModelImage(result, requestedModelId) {
  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result) ||
    typeof result.modelId !== "number" ||
    !Number.isInteger(result.modelId) ||
    result.modelId !== requestedModelId
  ) {
    throw createEquipmentModelImageContractError(
      "이미지가 등록된 기자재 모델 식별자를 확인할 수 없습니다.",
      result,
    );
  }

  return { modelId: result.modelId };
}

// 화면은 key만 사용하며 mock 데이터의 저장 위치를 알지 못하도록 구성함.
export const equipmentKeys = {
  all: ["equipment"],
  modelLists: () => ["equipment", "models", "list"],
  modelList: (params) => [
    "equipment",
    "models",
    "list",
    normalizeListParams(params),
  ],
  wishlistRoot: () => ["equipment", "wishlist"],
  wishlist: (params) => [
    "equipment",
    "wishlist",
    { pageSize: params?.size ?? 20 },
  ],
  adminModelLists: () => ["equipment", "admin", "models", "list"],
  adminModelList: (params) => [
    "equipment",
    "admin",
    "models",
    "list",
    normalizeListParams(params),
  ],
  adminModel: (modelId) => ["equipment", "admin", "models", modelId],
  adminItemLists: (modelId) => [
    "equipment",
    "admin",
    "items",
    modelId,
  ],
  adminItems: (params) => [
    "equipment",
    "admin",
    "items",
    params?.modelId ?? null,
    normalizeItemParams(params),
  ],
  adminItemCounts: (modelId) => [
    "equipment",
    "admin",
    "item-counts",
    modelId,
  ],
};

function assertMockMode() {
  if (isMockMode) {
    return;
  }

  const error = new Error("기자재 API가 아직 제공되지 않았습니다.");
  error.code = "EQUIPMENT_API_UNAVAILABLE";
  throw error;
}

// 학생 기자재와 찜은 실제 API가 없어 mock 모드에서만 사용함.
export async function getEquipmentModels(params = {}) {
  assertMockMode();
  return queryMockEquipmentModels(params);
}

export async function getMyWishlistedEquipmentModels(params = {}) {
  assertMockMode();
  return queryMockWishlistedEquipmentModels(params);
}

export async function setEquipmentModelWishlist(values) {
  assertMockMode();
  return updateMockEquipmentWishlist(values);
}

export async function getAdminEquipmentModelByID(modelId, options = {}) {
  if (isMockMode) {
    return getMockAdminEquipmentModelSummary(modelId, options);
  }

  const normalizedModelId = normalizeRequestedModelId(modelId);
  const result = await api.get(
    `/admin/equipment-models/${encodeURIComponent(String(normalizedModelId))}`,
    options,
  );

  return normalizeAdminEquipmentModelByID(result, normalizedModelId);
}

export async function getAdminEquipmentItems(params = {}) {
  if (isMockMode) {
    return queryMockAdminEquipmentItems(params);
  }

  const { signal, ...itemParams } = params;
  const { modelId, status, keyword, page, size } = normalizeItemParams(itemParams);
  const normalizedModelId = normalizeRequestedModelId(modelId);
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (keyword) {
    searchParams.set("keyword", keyword);
  }

  const serverStatus = ITEM_STATUS_REQUEST[status];
  if (serverStatus) {
    searchParams.set("status", serverStatus);
  }

  const result = await api.get(
    `/admin/equipment-models/${encodeURIComponent(String(normalizedModelId))}/items?${searchParams.toString()}`,
    { signal },
  );
  return normalizeAdminEquipmentItems(result);
}



// 관리자 모델 목록만 현재 확인된 실제 조회 계약을 사용함.
export async function getAdminEquipmentModels(params = {}) {
  if (isMockMode) {
    return queryMockAdminEquipmentModels(params);
  }

  const { signal, ...listParams } = params;
  const normalizedParams = normalizeListParams(listParams);
  const searchParams = new URLSearchParams({
    page: String(normalizedParams.page),
    size: String(normalizedParams.size),
  });

  if (normalizedParams.keyword) {
    searchParams.set("keyword", normalizedParams.keyword);
  }

  if (
    normalizedParams.categoryId !== null &&
    normalizedParams.categoryId !== undefined &&
    normalizedParams.categoryId !== ""
  ) {
    searchParams.set("categoryId", String(normalizedParams.categoryId));
  }

  const result = await api.get(
    `/admin/equipment-models?${searchParams.toString()}`,
    { signal },
  );

  return normalizeAdminEquipmentModelPage(result);
}

export async function createAdminEquipmentModel(values) {
  if (isMockMode) {
    return createMockAdminEquipmentModel(values);
  }

  const result = await api.post(
    "/admin/equipment-models",
    createAdminEquipmentModelRequest(values),
  );

  return normalizeCreatedEquipmentModel(result);
}

export async function uploadAdminEquipmentModelImage({ modelId, imageFile }) {
  if (isMockMode) {
    const error = new Error(
      "모델 이미지 업로드 API는 실제 서버 모드에서만 사용합니다.",
    );
    error.code = "EQUIPMENT_MODEL_IMAGE_UPLOAD_NOT_REQUIRED";
    throw error;
  }

  if (!Number.isInteger(modelId)) {
    throw new Error("이미지를 등록할 기자재 모델을 확인할 수 없습니다.");
  }

  if (
    !imageFile ||
    typeof Blob === "undefined" ||
    !(imageFile instanceof Blob)
  ) {
    throw new Error("등록할 모델 이미지를 선택해 주세요.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const result = await api.patch(
    `/admin/equipment-models/${encodeURIComponent(String(modelId))}/image`,
    formData,
  );

  return normalizeUploadedEquipmentModelImage(result, modelId);
}

// 모델 수정·폐기와 개별 기기 업무는 실제 API 연결 전까지 mock 모드로 제한함.
export async function updateAdminEquipmentModel(values) {
  assertMockMode();
  return updateMockAdminEquipmentModel(values);
}

export async function disposeAdminEquipmentModel(values) {
  assertMockMode();
  return disposeMockAdminEquipmentModel(values);
}

export async function getAdminEquipmentModelSummary(modelId, options) {
  return getAdminEquipmentModelByID(modelId, options);
}

export async function getAdminEquipmentItemCounts(modelId, options) {
  assertMockMode();
  return getMockAdminEquipmentItemCounts(modelId, options);
}

export async function createAdminEquipmentItems(values) {
  assertMockMode();
  return createMockAdminEquipmentItems(values);
}

export async function updateAdminEquipmentItem(values) {
  assertMockMode();
  return updateMockAdminEquipmentItem(values);
}

export async function disposeAdminEquipmentItem(values) {
  assertMockMode();
  return disposeMockAdminEquipmentItem(values);
}
