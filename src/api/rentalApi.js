import { isMockMode } from "./client";
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

function assertRentalMockMode() {
  if (isMockMode) {
    return;
  }

  const error = new Error("대여 API가 아직 제공되지 않았습니다.");
  error.code = "STUDENT_RENTAL_API_UNAVAILABLE";
  throw error;
}

// Swagger에 대여 API가 추가되면 아래 함수 내부만 실제 요청으로 교체함.
// 현재 상태값과 입력 구조는 모두 화면 확인용 mock 계약임.
export async function getStudentRentals(params = {}) {
  assertRentalMockMode();
  return queryMockStudentRentals({
    ...normalizeListParams(params, 50),
    signal: params.signal,
  });
}

export async function getStudentRentalCounts(options = {}) {
  assertRentalMockMode();
  return getMockStudentRentalCounts(options);
}

export async function getStudentRentalDetail(rentalId, options = {}) {
  assertRentalMockMode();
  return getMockStudentRentalDetail(rentalId, options);
}

export async function createStudentRental(values) {
  assertRentalMockMode();
  return createMockStudentRental(values);
}

export async function cancelStudentRental(values) {
  assertRentalMockMode();
  return cancelMockStudentRental(values);
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
  assertRentalMockMode();
  return queryMockAdminRentalApprovals({
    ...normalizeListParams(params),
    signal: params.signal,
  });
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
  assertRentalMockMode();
  return queryMockAdminRentalStatuses({
    ...normalizeListParams(params),
    signal: params.signal,
  });
}

export async function getAdminRentalStatusCounts(options = {}) {
  assertRentalMockMode();
  return getMockAdminRentalStatusCounts(options);
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
  assertRentalMockMode();
  return queryMockAdminRentalHistory({
    ...normalizeListParams(params),
    signal: params.signal,
  });
}

export async function getAdminRentalHistoryCounts(options = {}) {
  assertRentalMockMode();
  return getMockAdminRentalHistoryCounts(options);
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
