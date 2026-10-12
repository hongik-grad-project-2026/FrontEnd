import { isMockMode } from "./client";
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

// 아래 함수는 Swagger에 기자재 API가 추가되면 실제 요청으로 교체할 경계임.
// 현재는 mock 모드에서만 src/mocks의 상태를 사용하며 실제 서버로 요청하지 않음.
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

export async function getAdminEquipmentModels(params = {}) {
  assertMockMode();
  return queryMockAdminEquipmentModels(params);
}

export async function createAdminEquipmentModel(values) {
  assertMockMode();
  return createMockAdminEquipmentModel(values);
}

export async function updateAdminEquipmentModel(values) {
  assertMockMode();
  return updateMockAdminEquipmentModel(values);
}

export async function disposeAdminEquipmentModel(values) {
  assertMockMode();
  return disposeMockAdminEquipmentModel(values);
}

export async function getAdminEquipmentModelSummary(modelId, options) {
  assertMockMode();
  return getMockAdminEquipmentModelSummary(modelId, options);
}

export async function getAdminEquipmentItems(params = {}) {
  assertMockMode();
  return queryMockAdminEquipmentItems(params);
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
