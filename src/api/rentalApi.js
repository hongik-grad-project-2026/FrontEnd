import { api, isMockMode } from "./client";
import {
  mapAdminApproval,
  mapAdminDetail,
  mapAdminHistory,
  mapAdminSummary,
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
  adminImages: (rentalId, imageType) => ["rentals", "admin", "images", String(rentalId), imageType ?? "all"],
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
  adminDashboardModelUtilization: () => ["rentals", "admin", "dashboard", "model-utilization"],
  adminDashboardLongTermIdle: () => ["rentals", "admin", "dashboard", "long-term-idle"],
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

function rentalListPath(path, { statuses = [], keyword = "", userId, page = 0, size = 10 }) {
  const query = new URLSearchParams();
  for (const status of statuses) query.append("status", status);
  if (keyword.trim()) query.set("keyword", keyword.trim());
  if (userId != null) query.set("userId", String(userId));
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
    returned: counts?.returned ?? null,
    inactive: counts ? counts.canceled + counts.noShow + counts.rejected : null,
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
  const expectedReturnAt = values.expectedReturnAt?.trim();
  if (!purpose) throw new Error("대여 사유를 입력해 주세요.");
  if (!expectedReturnAt) throw new Error("반납 예정일을 확인해 주세요.");

  const result = await api.post("/rentals", {
    modelId,
    purpose,
    expectedPickupDate: formatPickupDate(values.pickupDate),
    expectedReturnAt,
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
  if (isMockMode) {
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

  const loadStatus = async (status) => {
    const rentals = [];
    let page = 0;
    let hasNext;
    do {
      const result = await getStudentRentals({ status, page, size: 100, signal: options.signal });
      rentals.push(...result.content);
      hasNext = result.hasNext;
      page += 1;
    } while (hasNext);
    return rentals;
  };

  const [pendingApproval, readyForPickup, renting] = await Promise.all([
    loadStatus("pendingApproval"),
    loadStatus("readyForPickup"),
    loadStatus("renting"),
  ]);
  return { pendingApproval, readyForPickup, renting };
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
  if (isMockMode) return approveMockRental(values);

  const rentalId = requireRentalId(values.rentalId);
  const result = await api.patch(`/admin/rentals/${rentalId}/approve`);
  if (result?.rentalId !== rentalId || result.status !== "READY_FOR_PICKUP") {
    throw new Error("대여 승인 결과를 확인할 수 없습니다.");
  }
  return result;
}

export async function rejectRental(values) {
  if (isMockMode) return rejectMockRental(values);

  const rentalId = requireRentalId(values.rentalId);
  const rejectReasonType = values.reason?.type;
  const rejectReasonDetail = values.reason?.detail?.trim();
  if (!["INSUFFICIENT_STOCK", "RENTAL_SUSPENDED", "OTHER"].includes(rejectReasonType)) {
    throw new Error("반려 사유를 선택해 주세요.");
  }
  if (rejectReasonType === "OTHER" && !rejectReasonDetail) {
    throw new Error("반려 사유를 입력해 주세요.");
  }
  if (rejectReasonDetail?.length > 500) {
    throw new Error("반려 사유는 500자 이내로 입력해 주세요.");
  }

  const result = await api.patch(`/admin/rentals/${rentalId}/reject`, {
    rejectReasonType,
    ...(rejectReasonDetail && { rejectReasonDetail }),
  });
  if (result?.rentalId !== rentalId || result.status !== "REJECTED") {
    throw new Error("대여 반려 결과를 확인할 수 없습니다.");
  }
  return result;
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
  if (isMockMode) return pickupMockRental(values);

  const rentalId = requireRentalId(values.rentalId);
  const result = await api.patch(`/admin/rentals/${rentalId}/checkout`);
  if (result?.rentalId !== rentalId || result.status !== "RENTING") {
    throw new Error("대여 수령 처리 결과를 확인할 수 없습니다.");
  }
  return result;
}

export async function returnRental(values) {
  if (isMockMode) return returnMockRental(values);

  const rentalId = requireRentalId(values.rentalId);
  const result = await api.patch(`/admin/rentals/${rentalId}/return`);
  if (result?.rentalId !== rentalId || result.status !== "RETURNED") {
    throw new Error("대여 반납 처리 결과를 확인할 수 없습니다.");
  }
  return result;
}

export async function getAdminRentalImages(rentalId, { imageType, signal } = {}) {
  const requestedId = requireRentalId(rentalId);
  if (imageType && !["PICKUP", "RETURN"].includes(imageType)) {
    throw new Error("대여 사진 종류가 올바르지 않습니다.");
  }
  const query = imageType ? `?imageType=${imageType}` : "";
  const result = await api.get(`/admin/rentals/${requestedId}/images${query}`, { signal });
  if (result?.rentalId !== requestedId || !Array.isArray(result.images)) {
    throw new Error("대여 사진 조회 결과를 확인할 수 없습니다.");
  }
  return result.images;
}

export async function uploadAdminRentalImage({ rentalId, imageType, image, imageSide }) {
  const requestedId = requireRentalId(rentalId);
  if (!["PICKUP", "RETURN"].includes(imageType) || !image) {
    throw new Error("업로드할 대여 사진을 확인해 주세요.");
  }
  const formData = new FormData();
  formData.append("image", image);

  const imageSideQuery = new URLSearchParams({ imageType });
  if (imageSide) imageSideQuery.set("imageSide", imageSide);

  const result = await api.post(
    `/admin/rentals/${requestedId}/images?${imageSideQuery.toString()}`,
    formData,
  );
  if (result?.rentalId !== requestedId || result.imageType !== imageType ||
    !Number.isSafeInteger(result.imageId)) {
    throw new Error("대여 사진 업로드 결과를 확인할 수 없습니다.");
  }
  return result;
}

export async function getAdminRentalHistory(params = {}) {
  if (isMockMode) {
    return queryMockAdminRentalHistory({
      ...normalizeListParams(params),
      signal: params.signal,
    });
  }
  const statuses = params.status === "inactive"
    ? ["CANCELED", "REJECTED", "NO_SHOW"]
    : params.status === "returned"
      ? ["RETURNED"]
      : ["CANCELED", "REJECTED", "NO_SHOW", "RETURNED"];
  return getRentalPage("/admin/rentals", { ...params, statuses }, mapAdminHistory);
}

export async function getAdminRentalHistoryCounts(options = {}) {
  if (isMockMode) return getMockAdminRentalHistoryCounts(options);
  const page = await getRentalPage("/admin/rentals", { page: 0, size: 1, signal: options.signal }, mapAdminHistory);
  const counts = page.statusCounts;
  return {
    all: counts ? counts.canceled + counts.rejected + counts.noShow + counts.returned : null,
    canceled: counts?.canceled ?? null,
    rejected: counts?.rejected ?? null,
    noShow: counts?.noShow ?? null,
    returned: counts?.returned ?? null,
  };
}

export async function getAdminRentalDashboard(options = {}) {
  if (isMockMode) return getMockAdminRentalDashboard(options);

  const today = options.today ?? (() => {
    const date = new Date();
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  })();
  const { signal } = options;
  const [approvalPage, overduePage, firstActivePage] = await Promise.all([
    getRentalPage("/admin/rentals", { page: 0, size: 1, statuses: ["PENDING_APPROVAL"], signal }, mapAdminSummary),
    getRentalPage("/admin/rentals", { page: 0, size: 1, statuses: ["OVERDUE"], signal }, mapAdminSummary),
    getRentalPage("/admin/rentals", {
      page: 0,
      size: 100,
      statuses: ["READY_FOR_PICKUP", "RENTING", "OVERDUE"],
      signal,
    }, mapAdminSummary),
  ]);

  let todayPickup = 0;
  let todayReturn = 0;
  let activePage = firstActivePage;
  while (true) {
    for (const rental of activePage.content) {
      if (rental.status === "readyForPickup" && rental.expectedPickupAt === today) todayPickup += 1;
      if ((rental.status === "renting" || rental.status === "overdue") &&
        rental.expectedReturnAt?.startsWith(today)) todayReturn += 1;
    }
    if (!activePage.hasNext) break;
    activePage = await getRentalPage("/admin/rentals", {
      page: activePage.page + 1,
      size: 100,
      statuses: ["READY_FOR_PICKUP", "RENTING", "OVERDUE"],
      signal,
    }, mapAdminSummary);
  }

  return {
    waitingApproval: approvalPage.totalElements,
    todayPickup,
    todayReturn,
    overdue: overduePage.totalElements,
  };
}

export async function getAdminModelUtilization(options = {}) {
  const result = await api.get("/admin/dashboard/model-utilization", {
    signal: options.signal,
  });

  if (
    !Array.isArray(result) ||
    result.some((category) =>
      typeof category?.categoryName !== "string" ||
      !Array.isArray(category.models) ||
      category.models.some((model) =>
        typeof model?.modelName !== "string" ||
        !Number.isSafeInteger(model.rentedCount) ||
        !Number.isSafeInteger(model.totalCount) ||
        model.rentedCount < 0 ||
        model.rentedCount > model.totalCount
      )
    )
  ) {
    throw new Error("모델별 가동률 응답을 확인할 수 없습니다.");
  }

  return result;
}

export async function getAdminLongTermIdle(options = {}) {
  const result = await api.get("/admin/dashboard/long-term-idle", {
    signal: options.signal,
  });

  if (
    !Array.isArray(result) ||
    result.some((item) =>
      typeof item?.modelName !== "string" ||
      typeof item.categoryName !== "string" ||
      !Number.isSafeInteger(item.idleDays) ||
      item.idleDays < 0
    )
  ) {
    throw new Error("장기 미대여 응답을 확인할 수 없습니다.");
  }

  return [...result].sort((a, b) => b.idleDays - a.idleDays).slice(0, 3);
}

export async function getMemberRentalHistory(memberId, params = {}) {
  assertRentalMockMode();
  return queryMockMemberRentalHistory({
    memberId,
    ...normalizeListParams(params),
    signal: params.signal,
  });
}

export async function getAdminMemberRentalHistory(memberId, params = {}) {
  if (isMockMode) return getMemberRentalHistory(memberId, params);

  const userId = Number(memberId);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new Error("회원 ID가 올바르지 않습니다.");
  }

  return getRentalPage("/admin/rentals", {
    ...params,
    userId,
  }, mapAdminHistory);
}

export async function getMemberRentalCount(memberId, options = {}) {
  if (!isMockMode) {
    const page = await getAdminMemberRentalHistory(memberId, {
      page: 0,
      size: 1,
      signal: options.signal,
    });
    return page.totalElements;
  }

  if (options.signal?.aborted) {
    const error = new Error("요청이 취소되었습니다.");
    error.name = "AbortError";
    throw error;
  }

  return getMockMemberRentalCount(memberId);
}
