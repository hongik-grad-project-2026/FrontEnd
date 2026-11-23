import { RENTAL_STATUS } from "../constants/status.js";

const SERVER_STATUS = Object.freeze({
  PENDING_APPROVAL: "pendingApproval",
  READY_FOR_PICKUP: "readyForPickup",
  RENTING: "renting",
  OVERDUE: "overdue",
  RETURNED: "returned",
  REJECTED: "rejected",
  CANCELED: "canceled",
  NO_SHOW: "noShow",
});

const SCREEN_STATUS = Object.freeze(
  Object.fromEntries(Object.entries(SERVER_STATUS).map(([server, screen]) => [screen, server])),
);

const CANCEL_REASON = Object.freeze({
  NO_LONGER_NEEDED: "필요 없어짐",
  WRONG_APPLICATION_INFO: "신청 정보 잘못 입력함",
  APPROVAL_DELAYED: "승인이 늦음",
});

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} 응답 형식이 올바르지 않습니다.`);
  }
  return value;
}

function requireRentalId(value) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error("서버 대여 ID를 확인할 수 없습니다.");
  }
  return value;
}

function optionalText(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function formatDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : null;
}

function formatDateTime(value) {
  const date = formatDate(value);
  if (!date) return null;
  const time = /[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(value);
  return time ? `${date}. ${time[1]}:${time[2]}${time[3] ? `:${time[3]}` : ""}` : date;
}

function datePart(value) {
  return value?.split(". ")[0] ?? null;
}

function timePart(value) {
  return value?.split(". ")[1] ?? null;
}

function applicationType(value) {
  if (value === "REGULAR") return "정기";
  if (value === "ON_DEMAND") return "상시";
  return "미확인";
}

// 반납 예정일이 없으면 수령 예정일 다음 영업일(주말 제외) 20:00을 반납 기한으로 계산한다.
function nextDayReturnDeadline(expectedPickupDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(expectedPickupDate ?? "");
  if (!match) return null;

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]) + 1,
  );

  // 토요일(6)·일요일(0)이면 다음 평일로 미룬다. (금요일 수령 → 월요일 반납)
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}.${month}.${day}. 20:00:00`;
}

function screenStatus(value) {
  return SERVER_STATUS[value] ?? "unknown";
}

export function serverStatusesFor(status) {
  if (status === "all" || !status) return [];
  if (status === "renting") return ["RENTING", "OVERDUE"];
  if (status === "inactive") return ["NO_SHOW", "REJECTED", "CANCELED"];
  const serverStatus = SCREEN_STATUS[status];
  if (!serverStatus) throw new Error("지원하지 않는 대여 상태 필터입니다.");
  return [serverStatus];
}

export function statusCounts(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (Object.keys(value).length > 0 && !Object.keys(value).some((key) => key in SERVER_STATUS)) {
    return null;
  }
  return Object.fromEntries(
    Object.entries(SERVER_STATUS).map(([server, screen]) => {
      const count = value[server];
      if (count != null && (!Number.isSafeInteger(count) || count < 0)) {
        throw new Error("대여 상태별 개수 응답 형식이 올바르지 않습니다.");
      }
      return [screen, count ?? 0];
    }),
  );
}

export function mapRentalPage(value, mapRecord, requestedPage) {
  const page = requireObject(value, "대여 목록");
  if (!Array.isArray(page.content) || !Number.isSafeInteger(page.page) || page.page !== requestedPage ||
    !Number.isSafeInteger(page.size) || page.size < 1 ||
    !Number.isSafeInteger(page.totalElements) || page.totalElements < 0 ||
    !Number.isSafeInteger(page.totalPages) || page.totalPages < 0 ||
    typeof page.hasNext !== "boolean") {
    throw new Error("대여 목록의 페이지 정보를 확인할 수 없습니다.");
  }
  return {
    content: page.content.map(mapRecord),
    page: page.page,
    size: page.size,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
    hasNext: page.hasNext,
    statusCounts: statusCounts(page.statusCounts),
  };
}

export function mapStudentSummary(value) {
  const rental = requireObject(value, "학생 대여");
  return {
    rentalId: requireRentalId(rental.rentalId),
    modelId: rental.modelId ?? null,
    status: screenStatus(rental.status),
    category: optionalText(rental.categoryName),
    equipmentName: optionalText(rental.modelName) ?? "모델명 미확인",
    imageUrl: optionalText(rental.modelImageUrl),
    assetNumber: optionalText(rental.labelCode),
    rentalType: applicationType(rental.applicationType),
    requestedAt: formatDateTime(rental.createdAt),
    expectedPickupAt: formatDate(rental.expectedPickupDate),
    expectedReturnAt:
      formatDateTime(rental.expectedReturnAt) ??
      nextDayReturnDeadline(rental.expectedPickupDate),
    actualPickupAt: formatDateTime(rental.actualPickupAt),
    actualReturnAt: formatDateTime(rental.actualReturnAt),
    canceledAt: formatDateTime(rental.canceledAt),
    cancelReason: CANCEL_REASON[rental.cancelReason] ?? optionalText(rental.cancelReason),
    rejectedAt: null,
    rejectReasonType: optionalText(rental.rejectReasonType),
    rejectReasonDetail: optionalText(rental.rejectReasonDetail),
    noShowAt: null,
  };
}

export function mapStudentDetail(value, requestedId) {
  const rental = requireObject(value, "학생 대여 상세");
  if (requireRentalId(rental.rentalId) !== requestedId) {
    throw new Error("요청한 대여내역과 서버 상세 응답의 ID가 다릅니다.");
  }
  return {
    ...mapStudentSummary(rental),
    description: optionalText(rental.modelDescription),
    components: optionalText(rental.components),
    reason: optionalText(rental.purpose),
    memo: optionalText(rental.memo),
    approvedAt: rental.status === "REJECTED" ? null : formatDateTime(rental.reviewedAt),
    rejectedAt: rental.status === "REJECTED" ? formatDateTime(rental.reviewedAt) : null,
    checkoutPhotoUrl: optionalText(rental.pickupImageUrl),
    returnPhotoUrl: optionalText(rental.returnImageUrl),
    pledgeUrl: null,
  };
}

export function mapAdminSummary(value) {
  const rental = requireObject(value, "관리자 대여");
  return {
    rentalId: requireRentalId(rental.rentalId),
    userId: rental.userId ?? null,
    studentName: optionalText(rental.userName) ?? "이름 미확인",
    studentId: optionalText(rental.studentId),
    department: optionalText(rental.department),
    category: optionalText(rental.categoryName),
    equipmentName: optionalText(rental.modelName) ?? "모델명 미확인",
    imageSrc: optionalText(rental.modelImageUrl),
    modelId: rental.modelId ?? null,
    assetNumber: optionalText(rental.labelCode),
    labelNumber: optionalText(rental.labelCode),
    rentalType: applicationType(rental.applicationType),
    status: screenStatus(rental.status),
    reason: optionalText(rental.purpose),
    expectedPickupAt: formatDate(rental.expectedPickupDate),
    expectedReturnAt:
      formatDateTime(rental.expectedReturnAt) ??
      nextDayReturnDeadline(rental.expectedPickupDate),
    actualPickupAt: formatDateTime(rental.actualPickupAt),
    actualReturnAt: formatDateTime(rental.actualReturnAt),
    requestedAt: formatDateTime(rental.createdAt),
  };
}

export function mapAdminApproval(value) {
  const rental = mapAdminSummary(value);
  return {
    ...rental,
    category: rental.category,
    startDate: datePart(rental.expectedPickupAt),
    endDate: datePart(rental.expectedReturnAt),
    requestedDate: datePart(rental.requestedAt),
    requestedTime: timePart(rental.requestedAt),
    expectedReturnAt:
      formatDateTime(rental.expectedReturnAt) ??
      nextDayReturnDeadline(rental.expectedPickupDate),
  };
}

export function mapAdminStatus(value) {
  const rental = mapAdminSummary(value);
  const waiting = rental.status === "readyForPickup";
  return {
    ...rental,
    ariaLabel: `${waiting ? "수령대기" : rental.status === "overdue" ? "연체" : "대여중"} 대여 카드`,
    infoFields: waiting ? [
      { id: "student", label: "학생 정보", value: `${rental.studentName} (${rental.studentId ?? "-"})` },
      { id: "scheduled-pickup", label: "수령 예정일", value: rental.expectedPickupAt, underlined: true },
      { id: "scheduled-return", label: "반납 예정일", value: rental.expectedReturnAt },
      { id: "rental-reason", label: "대여 사유", value: rental.reason },
    ] : [
      { id: "student", label: "학생 정보", value: `${rental.studentName} (${rental.studentId ?? "-"})` },
      { id: "rental-requested-at", label: "대여 신청일", value: rental.requestedAt },
      { id: "picked-up-at", label: "수령일", value: rental.actualPickupAt },
      { id: "scheduled-return", label: "반납 예정일", value: rental.expectedReturnAt, underlined: true, tone: rental.status === "overdue" ? "danger" : undefined },
    ],
  };
}

export function mapAdminHistory(value) {
  const rental = mapAdminSummary(value);
  return {
    ...rental,
    os: null,
    requestedDate: datePart(rental.requestedAt),
    pickupDate: datePart(rental.actualPickupAt),
    returnedDate: datePart(rental.actualReturnAt),
  };
}

export function mapAdminDetail(value, requestedId) {
  const rental = requireObject(value, "관리자 대여 상세");
  if (requireRentalId(rental.rentalId) !== requestedId) {
    throw new Error("요청한 대여내역과 서버 상세 응답의 ID가 다릅니다.");
  }
  const user = rental.user && requireObject(rental.user, "대여 사용자");
  const model = rental.model && requireObject(rental.model, "대여 모델");
  return {
    rentalId: rental.rentalId,
    userId: user?.userId ?? null,
    studentName: optionalText(user?.name) ?? "이름 미확인",
    studentEmail: optionalText(user?.email),
    studentPhone: optionalText(user?.phone),
    studentId: optionalText(user?.studentId),
    department: optionalText(user?.department),
    modelId: model?.modelId ?? null,
    category: optionalText(model?.categoryName),
    equipmentName: optionalText(model?.modelName) ?? "모델명 미확인",
    description: optionalText(model?.description),
    accessories: optionalText(model?.components),
    labelNumber: optionalText(rental.labelCode),
    rentalType: applicationType(rental.applicationType),
    status: screenStatus(rental.status),
    reason: optionalText(rental.purpose),
    requestedAt: formatDateTime(rental.createdAt),
    expectedPickupAt: formatDate(rental.expectedPickupDate),
    expectedReturnAt:
      formatDateTime(rental.expectedReturnAt) ??
      nextDayReturnDeadline(rental.expectedPickupDate),
    approvedAt: formatDateTime(rental.reviewedAt),
    rejectedAt: formatDateTime(rental.reviewedAt),
    actualPickupAt: formatDateTime(rental.actualPickupAt),
    actualReturnAt: formatDateTime(rental.actualReturnAt),
    canceledAt: formatDateTime(rental.canceledAt),
    cancelReason: CANCEL_REASON[rental.cancelReason] ?? optionalText(rental.cancelReason),
    rejectReasonType: optionalText(rental.rejectReasonType),
    rejectReasonDetail: optionalText(rental.rejectReasonDetail),
    images: Array.isArray(rental.images) ? rental.images : [],
  };
}
