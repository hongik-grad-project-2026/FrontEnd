import { api, isMockMode } from "./client";
import {
  mapAdminApproval,
  mapAdminDetail,
  mapAdminHistory,
  mapAdminStatus,
  mapRentalPage,
  mapStudentDetail,
  mapStudentSummary,
  serverStatusesFor,
} from "./rentalAdapter";
import {
  approveMockRental,
  cancelMockStudentRental,
  createMockStudentRental,
  getMockAdminRentalDashboard,
  getMockAdminRentalHistoryCounts,
  getMockAdminRentalStatusCounts,
  getMockMemberRentalCount,
  getMockStudentRentalCounts,
  getMockStudentRentalDetail,
  MOCK_STUDENT_RENTAL_CANCEL_REASONS,
  pickupMockRental,
  queryMockAdminRentalApprovals,
  queryMockAdminRentalHistory,
  queryMockAdminRentalStatuses,
  queryMockMemberRentalHistory,
  queryMockStudentRentals,
  rejectMockRental,
  returnMockRental,
} from "../mocks/studentRentalData";

function normalizeListParams(params = {}, defaultSize = 10) {
  return {
    status: params.status ?? "all",
    keyword: params.keyword?.trim() ?? "",
    page: params.page ?? 0,
    size: params.size ?? defaultSize,
    sort: params.sort ?? "requestedAt,desc",
  };
}

export const rentalKeys = {
  all: ["rentals"],
  adminDetail: (rentalId) => ["rentals", "admin", "detail", String(rentalId)],
  adminApprovalLists: () => ["rentals", "admin", "approval", "list"],
  adminApprovalList: (params) => [
    "rentals",
    "admin",
    "approval",
    "list",
    normalizeListParams(params),
  ],
  adminStatusLists: () => ["rentals", "admin", "status", "list"],
  adminStatusList: (params) => [
    "rentals",
    "admin",
    "status",
    "list",
    normalizeListParams(params),
  ],
  adminStatusCounts: () => ["rentals", "admin", "status", "counts"],
  adminHistoryLists: () => ["rentals", "admin", "history", "list"],
  adminHistoryList: (params) => [
    "rentals",
    "admin",
    "history",
    "list",
    normalizeListParams(params),
  ],
  adminHistoryCounts: () => ["rentals", "admin", "history", "counts"],
  adminDashboard: () => ["rentals", "admin", "dashboard"],
  memberHistories: () => ["rentals", "admin", "member-history"],
  memberHistory: (memberId, params) => [
    "rentals",
    "admin",
    "member-history",
    String(memberId),
    normalizeListParams(params),
  ],
  memberCounts: () => ["rentals", "admin", "member-count"],
  memberCount: (memberId) => [
    "rentals",
    "admin",
    "member-count",
    String(memberId),
  ],
};

export const studentRentalKeys = {
  all: ["student-rentals"],
  lists: () => ["student-rentals", "list"],
  list: (params) => [
    "student-rentals",
    "list",
    normalizeListParams(params, 50),
  ],
  counts: () => ["student-rentals", "counts"],
  details: () => ["student-rentals", "detail"],
  detail: (rentalId) => ["student-rentals", "detail", String(rentalId)],
  dashboard: () => ["student-rentals", "dashboard"],
};

export const studentRentalCancelReasons = MOCK_STUDENT_RENTAL_CANCEL_REASONS;

const CANCEL_REASON_REQUEST = Object.freeze({
  "필요 없어짐": "NO_LONGER_NEEDED",
  "신청 정보 잘못 입력함": "WRONG_APPLICATION_INFO",
  "승인이 늦음": "APPROVAL_DELAYED",
});

function requireRentalId(value) {
  const rentalId = Number(value);
  if (!Number.isSafeInteger(rentalId) || rentalId < 1) {
    throw new Error("대여 ID가 올바르지 않습니다.");
  }
  return rentalId;
}

function formatPickupDate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error("수령 희망일을 확인해 주세요.");
  }
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function assertRentalMockMode() {
  if (isMockMode) {
    return;
  }

  const error = new Error("이 기능은 실제 API에 아직 연결되지 않았습니다.");
  error.code = "STUDENT_RENTAL_API_UNAVAILABLE";
  throw error;
}

function rentalListPath(path, { statuses = [], keyword = "", page = 0, size = 10 }) {
  const query = new URLSearchParams();
  for (const status of statuses) query.append("status", status);
  if (keyword.trim()) query.set("keyword", keyword.trim());
  query.set("page", String(page));
  query.set("size", String(size));
  return `${path}?${query.toString()}`;
}

async function getRentalPage(path, params, mapRecord) {
  const { signal, page = 0 } = params;
  const result = await api.get(rentalListPath(path, params), { signal });
  return mapRentalPage(result, mapRecord, page);
}

export async function getStudentRentals(params = {}) {
  if (isMockMode) {
    return queryMockStudentRentals({
      ...normalizeListParams(params, 50),
      signal: params.signal,
    });
  }
  return getRentalPage("/rentals/me", {
    ...params,
    size: params.size ?? 50,
    statuses: serverStatusesFor(params.status),
  }, mapStudentSummary);
}

export async function getStudentRentalCounts(options = {}) {
  if (isMockMode) return getMockStudentRentalCounts(options);
  const page = await getStudentRentals({ page: 0, size: 1, signal: options.signal });
  const counts = page.statusCounts;
  return {
    all: page.totalElements,
    pendingApproval: counts?.pendingApproval ?? null,
    readyForPickup: counts?.readyForPickup ?? null,
    renting: counts ? counts.renting + counts.overdue : null,
    overdue: counts?.overdue ?? null,
    canceled: counts?.canceled ?? null,
    returned: counts?.returned ?? null,
  };
}

export async function getStudentRentalDetail(rentalId, options = {}) {
  if (isMockMode) return getMockStudentRentalDetail(rentalId, options);
  const requestedId = Number(rentalId);
  if (!Number.isSafeInteger(requestedId) || requestedId < 1) {
    throw new Error("대여 ID가 올바르지 않습니다.");
  }
  const result = await api.get(`/rentals/me/${requestedId}`, { signal: options.signal });
  return mapStudentDetail(result, requestedId);
}

export async function createStudentRental(values) {
  if (isMockMode) return createMockStudentRental(values);

  const modelId = requireRentalId(values.model?.modelId ?? values.modelId);
  const purpose = values.reason?.trim();
  if (!purpose) throw new Error("대여 사유를 입력해 주세요.");

  const result = await api.post("/rentals", {
    modelId,
    purpose,
    expectedPickupDate: formatPickupDate(values.pickupDate),
    ...(values.memo?.trim() && { memo: values.memo.trim() }),
  });

  if (!result || !Number.isSafeInteger(result.rentalId) || result.rentalId < 1) {
    throw new Error("대여 신청 결과의 ID를 확인할 수 없습니다.");
  }
  return result;
}

export async function cancelStudentRental(values) {
  if (isMockMode) return cancelMockStudentRental(values);

  const rentalId = requireRentalId(values.rentalId);
  const cancelReason = CANCEL_REASON_REQUEST[values.reason];
  if (!cancelReason) throw new Error("신청 취소 사유를 선택해 주세요.");

  const result = await api.patch(
    `/rentals/me/${rentalId}/cancel`,
    { cancelReason },
  );
  if (result?.rentalId !== rentalId || result.status !== "CANCELED") {
    throw new Error("대여 신청 취소 결과를 확인할 수 없습니다.");
  }
  return result;
}

export async function getStudentRentalDashboard(options = {}) {
  assertRentalMockMode();
  const { content } = await queryMockStudentRentals({
    page: 0,
    size: 50,
    status: "all",
    signal: options.signal,
  });

  return {
    pendingApproval: content.filter((rental) => rental.status === "pendingApproval"),
    readyForPickup: content.filter((rental) => rental.status === "readyForPickup"),
    renting: content.filter(
      (rental) => rental.status === "renting" || rental.status === "overdue",
    ),
  };
}

export async function getAdminRentalApprovals(params = {}) {
  if (isMockMode) {
    return queryMockAdminRentalApprovals({
      ...normalizeListParams(params),
      signal: params.signal,
    });
  }
  return getRentalPage("/admin/rentals", {
    ...params,
    statuses: ["PENDING_APPROVAL"],
  }, mapAdminApproval);
}

export async function getAdminRentalDetail(rentalId, options = {}) {
  if (isMockMode) {
    throw new Error("mock 상세 조회는 기존 목록 데이터를 사용합니다.");
  }
  const requestedId = Number(rentalId);
  if (!Number.isSafeInteger(requestedId) || requestedId < 1) {
    throw new Error("대여 ID가 올바르지 않습니다.");
  }
  const result = await api.get(`/admin/rentals/${requestedId}`, { signal: options.signal });
  return mapAdminDetail(result, requestedId);
}

export async function approveRental(values) {
  assertRentalMockMode();
  return approveMockRental(values);
}

export async function rejectRental(values) {
  assertRentalMockMode();
  return rejectMockRental(values);
}

export async function getAdminRentalStatuses(params = {}) {
  if (isMockMode) {
    return queryMockAdminRentalStatuses({
      ...normalizeListParams(params),
      signal: params.signal,
    });
  }
  const statuses = params.status === "readyForPickup"
    ? ["READY_FOR_PICKUP"]
    : params.status === "renting"
      ? ["RENTING", "OVERDUE"]
      : ["READY_FOR_PICKUP", "RENTING", "OVERDUE"];
  return getRentalPage("/admin/rentals", { ...params, statuses }, mapAdminStatus);
}

export async function getAdminRentalStatusCounts(options = {}) {
  if (isMockMode) return getMockAdminRentalStatusCounts(options);
  const page = await getRentalPage("/admin/rentals", { page: 0, size: 1, signal: options.signal }, mapAdminStatus);
  const counts = page.statusCounts;
  return {
    all: counts ? counts.readyForPickup + counts.renting + counts.overdue : null,
    readyForPickup: counts?.readyForPickup ?? null,
    renting: counts ? counts.renting + counts.overdue : null,
    overdue: counts?.overdue ?? null,
  };
}

export async function pickupRental(values) {
  assertRentalMockMode();
  return pickupMockRental(values);
}

export async function returnRental(values) {
  assertRentalMockMode();
  return returnMockRental(values);
}

export async function getAdminRentalHistory(params = {}) {
  if (isMockMode) {
    return queryMockAdminRentalHistory({
      ...normalizeListParams(params),
      signal: params.signal,
    });
  }
  const statuses = params.status === "canceled"
    ? ["CANCELED"]
    : params.status === "returned"
      ? ["RETURNED"]
      : ["CANCELED", "RETURNED"];
  return getRentalPage("/admin/rentals", { ...params, statuses }, mapAdminHistory);
}

export async function getAdminRentalHistoryCounts(options = {}) {
  if (isMockMode) return getMockAdminRentalHistoryCounts(options);
  const page = await getRentalPage("/admin/rentals", { page: 0, size: 1, signal: options.signal }, mapAdminHistory);
  const counts = page.statusCounts;
  return {
    all: counts ? counts.canceled + counts.returned : null,
    canceled: counts?.canceled ?? null,
    returned: counts?.returned ?? null,
  };
}

export async function getAdminRentalDashboard(options = {}) {
  assertRentalMockMode();
  return getMockAdminRentalDashboard(options);
}

export async function getMemberRentalHistory(memberId, params = {}) {
  assertRentalMockMode();
  return queryMockMemberRentalHistory({
    memberId,
    ...normalizeListParams(params),
    signal: params.signal,
  });
}

export async function getMemberRentalCount(memberId, options = {}) {
  assertRentalMockMode();

  if (options.signal?.aborted) {
    const error = new Error("요청이 취소되었습니다.");
    error.name = "AbortError";
    throw error;
  }

  return getMockMemberRentalCount(memberId);
}
