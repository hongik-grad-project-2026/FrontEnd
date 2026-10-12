// 상태값은 학생 대여 화면 확인을 위한 mock 전용 계약임.
// 실제 서버 상태값은 대여 API가 Swagger에 추가된 뒤 별도로 변환함.
export const MOCK_STUDENT_RENTAL_STATUSES = Object.freeze([
  "approvalPending",
  "pickupPending",
  "renting",
  "overdue",
  "canceled",
  "returned",
]);

// 관리자 반려는 학생 신청 취소와 다른 mock 결과로 관리함.
// 실제 서버 상태값은 대여 API 계약이 나온 뒤 별도로 변환함.
export const MOCK_ADMIN_RENTAL_RESULTS = Object.freeze(["rejected"]);

export const MOCK_STUDENT_RENTAL_CANCEL_REASONS = Object.freeze([
  "필요 없어짐",
  "신청 정보 잘못 입력함",
  "승인이 늦음",
]);

const INITIAL_STUDENT_RENTALS = [
  {
    rentalId: "R2026101001",
    modelId: "mock-catalog-model-1",
    itemId: null,
    assetNumber: null,
    labelNumber: null,
    status: "approvalPending",
    category: "노트북",
    equipmentName: "LG gram Pro 16",
    imageUrl: null,
    description: "휴대용 고성능 노트북입니다.",
    components: "본체, 파우치, 충전기",
    rentalType: "장기",
    requestedAt: "2026.10.08. 09:30:00",
    expectedPickupAt: "2026.10.13. 14:00",
    expectedReturnAt: "2026.11.10. 17:00",
    reason: "수업 프로젝트 편집 작업에 사용합니다.",
    approvedAt: null,
    actualPickupAt: null,
    actualReturnAt: null,
    canceledAt: null,
    cancelReason: null,
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  },
  {
    rentalId: "R2026101002",
    modelId: "mock-catalog-model-2",
    itemId: null,
    assetNumber: null,
    labelNumber: null,
    status: "approvalPending",
    category: "카메라",
    equipmentName: "Sony A7 IV",
    imageUrl: null,
    description: "사진 및 영상 촬영용 미러리스 카메라입니다.",
    components: "본체, 배터리, 충전기, 스트랩",
    rentalType: "단기",
    requestedAt: "2026.10.09. 15:20:00",
    expectedPickupAt: "2026.10.14. 10:00",
    expectedReturnAt: "2026.10.16. 17:00",
    reason: "학과 행사 촬영에 사용합니다.",
    approvedAt: null,
    actualPickupAt: null,
    actualReturnAt: null,
    canceledAt: null,
    cancelReason: null,
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  },
  {
    rentalId: "R2026100901",
    modelId: "mock-catalog-model-3",
    itemId: "mock-item-0301",
    assetNumber: "0000301",
    labelNumber: "CAM-301",
    status: "pickupPending",
    category: "카메라",
    equipmentName: "Canon EOS R6 Mark II",
    imageUrl: null,
    description: "고화질 영상 촬영을 지원하는 카메라입니다.",
    components: "본체, 배터리 2개, 충전기, 스트랩",
    rentalType: "단기",
    requestedAt: "2026.10.05. 11:10:00",
    expectedPickupAt: "2026.10.11. 13:00",
    expectedReturnAt: "2026.10.14. 17:00",
    reason: "졸업 작품 촬영에 사용합니다.",
    approvedAt: "2026.10.06. 10:00:00",
    actualPickupAt: null,
    actualReturnAt: null,
    canceledAt: null,
    cancelReason: null,
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  },
  {
    rentalId: "R2026100701",
    modelId: "mock-catalog-model-4",
    itemId: "mock-item-0412",
    assetNumber: "0000412",
    labelNumber: "REC-412",
    status: "renting",
    category: "녹음기",
    equipmentName: "Zoom H6 레코더",
    imageUrl: null,
    description: "다채널 현장 녹음을 지원하는 휴대용 레코더입니다.",
    components: "본체, 마이크 캡슐, USB 케이블, 케이스",
    rentalType: "단기",
    requestedAt: "2026.10.01. 14:40:00",
    expectedPickupAt: "2026.10.04. 10:00",
    expectedReturnAt: "2026.10.18. 17:00",
    reason: "다큐멘터리 인터뷰 녹음에 사용합니다.",
    approvedAt: "2026.10.02. 09:15:00",
    actualPickupAt: "2026.10.04. 10:05",
    actualReturnAt: null,
    canceledAt: null,
    cancelReason: null,
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  },
  {
    rentalId: "R2026092001",
    modelId: "mock-catalog-model-5",
    itemId: "mock-item-0520",
    assetNumber: "0000520",
    labelNumber: "LENS-520",
    status: "overdue",
    category: "렌즈",
    equipmentName: "FE 24-70mm F2.8 GM II",
    imageUrl: null,
    description: "표준 화각을 지원하는 줌 렌즈입니다.",
    components: "렌즈, 앞캡, 뒷캡, 후드, 파우치",
    rentalType: "장기",
    requestedAt: "2026.09.15. 16:00:00",
    expectedPickupAt: "2026.09.18. 13:00",
    expectedReturnAt: "2026.10.03. 17:00",
    reason: "장기 영상 프로젝트 촬영에 사용합니다.",
    approvedAt: "2026.09.16. 09:30:00",
    actualPickupAt: "2026.09.18. 13:10",
    actualReturnAt: null,
    canceledAt: null,
    cancelReason: null,
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  },
  {
    rentalId: "R2026091801",
    modelId: "mock-catalog-model-6",
    itemId: null,
    assetNumber: null,
    labelNumber: null,
    status: "canceled",
    category: "마이크",
    equipmentName: "RODE Wireless GO II",
    imageUrl: null,
    description: "무선 인터뷰 녹음용 핀마이크입니다.",
    components: "송신기 2개, 수신기, 케이블, 파우치",
    rentalType: "단기",
    requestedAt: "2026.09.18. 10:20:00",
    expectedPickupAt: "2026.09.22. 14:00",
    expectedReturnAt: "2026.09.24. 17:00",
    reason: "인터뷰 촬영에 사용하려고 신청했습니다.",
    approvedAt: null,
    actualPickupAt: null,
    actualReturnAt: null,
    canceledAt: "2026.09.19. 12:10",
    cancelReason: "필요 없어짐",
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  },
  {
    rentalId: "R2026081201",
    modelId: "mock-catalog-model-7",
    itemId: "mock-item-0711",
    assetNumber: "0000711",
    labelNumber: "STB-711",
    status: "returned",
    category: "짐벌",
    equipmentName: "DJI RS 3",
    imageUrl: null,
    description: "카메라 흔들림을 줄이는 촬영용 짐벌입니다.",
    components: "본체, 삼각대, 플레이트, 충전 케이블",
    rentalType: "단기",
    requestedAt: "2026.08.12. 13:25:00",
    expectedPickupAt: "2026.08.15. 10:00",
    expectedReturnAt: "2026.08.20. 17:00",
    reason: "교내 홍보 영상 촬영에 사용했습니다.",
    approvedAt: "2026.08.13. 09:00:00",
    actualPickupAt: "2026.08.15. 10:10",
    actualReturnAt: "2026.08.20. 16:45",
    canceledAt: null,
    cancelReason: null,
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  },
];

const MOCK_CURRENT_STUDENT = Object.freeze({
  userId: 2,
  studentId: "C111111",
  studentName: "홍길동",
  studentEmail: "student@hongik.ac.kr",
  studentPhone: "01012345678",
  college: "공과대학",
  department: "컴퓨터공학과",
});

const APPROVAL_TEMPLATES = [
  {
    category: "노트북",
    equipmentName: "HP Elite x360 1040 G10 2-in-1",
    description: "화면 확인용 노트북입니다.",
    components: "본체, 파우치, 충전선",
    reason: "캡스톤 디자인 프로젝트 발표 준비",
    rentalType: "장기",
    department: "컴퓨터공학과",
  },
  {
    category: "카메라",
    equipmentName: "Sony Alpha A7 IV",
    description: "화면 확인용 카메라입니다.",
    components: "본체, 배터리, 충전기, 스트랩",
    reason: "졸업 작품 영상 촬영",
    rentalType: "단기",
    department: "시각디자인과",
  },
  {
    category: "태블릿",
    equipmentName: "iPad Pro 12.9",
    description: "화면 확인용 태블릿입니다.",
    components: "본체, 케이스, 충전선",
    reason: "UX 프로토타입 사용성 테스트",
    rentalType: "단기",
    department: "산업디자인과",
  },
];

const INITIAL_ADMIN_APPROVAL_RENTALS = Array.from(
  { length: 24 },
  (_, index) => {
    const sequence = index + 1;
    const template = APPROVAL_TEMPLATES[index % APPROVAL_TEMPLATES.length];
    const day = String(22 - (index % 7)).padStart(2, "0");

    return {
      rentalId: `AR202608${String(sequence).padStart(4, "0")}`,
      userId: 1000 + sequence,
      studentId: `C${String(sequence).padStart(6, "0")}`,
      studentName: `${["김", "이", "박"][index % 3]}홍익`,
      studentEmail: `mock${sequence}@g.hongik.ac.kr`,
      studentPhone: `0100000${String(sequence).padStart(4, "0")}`,
      college: "조형대학",
      department: template.department,
      modelId: `mock-admin-approval-model-${sequence}`,
      itemId: null,
      assetNumber: null,
      labelNumber: null,
      status: "approvalPending",
      category: template.category,
      equipmentName: template.equipmentName,
      modelName: template.equipmentName,
      imageUrl: null,
      description: template.description,
      components: template.components,
      rentalType: template.rentalType,
      requestedAt: `2026.08.${day}. 09:30:00`,
      expectedPickupAt: `2026.08.25. 10:00`,
      expectedReturnAt: `2026.08.29. 17:00`,
      reason: template.reason,
      approvedAt: null,
      actualPickupAt: null,
      actualReturnAt: null,
      canceledAt: null,
      cancelReason: null,
      rejectedAt: null,
      rejectionReason: null,
      checkoutPhotoUrl: null,
      returnPhotoUrl: null,
      pledgeUrl: null,
    };
  },
);

const INITIAL_MEMBER_RENTALS = [
  {
    rentalId: "MR2026090001",
    userId: 1,
    studentId: "C000001",
    studentName: "가상학생가",
    studentEmail: "student01@example.com",
    studentPhone: "010-0000-0000",
    college: "공과대학",
    department: "컴퓨터공학과",
    modelId: "mock-member-model-1",
    itemId: "mock-member-item-1",
    assetNumber: "MOCK-ASSET-0001",
    labelNumber: "MEMBER-001",
    status: "returned",
    category: "노트북",
    equipmentName: "화면 확인용 노트북 A",
    modelName: "MOCK-LAPTOP-A",
    os: "Windows",
    imageUrl: null,
    description: "회원 상세 화면 확인용 기자재입니다.",
    components: "본체, 파우치, 충전기",
    rentalType: "장기",
    requestedAt: "2026.09.18. 09:00:00",
    expectedPickupAt: "2026.09.19. 10:00",
    expectedReturnAt: "2026.09.26. 17:00",
    reason: "회원 상세 대여 기록 확인",
    approvedAt: "2026.09.18. 12:00:00",
    actualPickupAt: "2026.09.19. 10:05",
    actualReturnAt: "2026.09.26. 16:50",
    canceledAt: null,
    cancelReason: null,
    rejectedAt: null,
    rejectionReason: null,
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  },
  {
    rentalId: "MR2026100002",
    userId: 1,
    studentId: "C000001",
    studentName: "가상학생가",
    studentEmail: "student01@example.com",
    studentPhone: "010-0000-0000",
    college: "공과대학",
    department: "컴퓨터공학과",
    modelId: "mock-member-model-2",
    itemId: "mock-member-item-2",
    assetNumber: "MOCK-ASSET-0002",
    labelNumber: "MEMBER-002",
    status: "renting",
    category: "태블릿",
    equipmentName: "화면 확인용 태블릿 A",
    modelName: "MOCK-TABLET-A",
    os: "Android",
    imageUrl: null,
    description: "회원 상세 화면 확인용 기자재입니다.",
    components: "본체, 케이스, 충전기",
    rentalType: "단기",
    requestedAt: "2026.10.01. 09:00:00",
    expectedPickupAt: "2026.10.02. 10:00",
    expectedReturnAt: "2026.10.20. 17:00",
    reason: "회원 상세 대여 현황 확인",
    approvedAt: "2026.10.01. 12:00:00",
    actualPickupAt: "2026.10.02. 10:05",
    actualReturnAt: null,
    canceledAt: null,
    cancelReason: null,
    rejectedAt: null,
    rejectionReason: null,
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  },
];

const INITIAL_MOCK_RENTALS = [
  ...INITIAL_STUDENT_RENTALS.map((rental) => ({
    ...MOCK_CURRENT_STUDENT,
    modelName: rental.equipmentName,
    os: null,
    rejectedAt: null,
    rejectionReason: null,
    ...rental,
  })),
  ...INITIAL_ADMIN_APPROVAL_RENTALS,
  ...INITIAL_MEMBER_RENTALS,
];

let mockRentals = structuredClone(INITIAL_MOCK_RENTALS);

function clone(value) {
  return structuredClone(value);
}

function createMockError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
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

function matchesStatus(status, selectedStatus) {
  if (!selectedStatus || selectedStatus === "all") {
    return true;
  }

  if (selectedStatus === "renting") {
    return status === "renting" || status === "overdue";
  }

  return status === selectedStatus;
}

function normalizeSearch(value) {
  return String(value ?? "").trim().toLowerCase();
}

function toPage(items, page, size) {
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
  };
}

function formatMockDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}. ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatInputDateTime(date, time) {
  return `${String(date).replaceAll("-", ".")}. ${time}`;
}

function getDatePart(value) {
  return value ? String(value).slice(0, 10).replaceAll("-", ".") : null;
}

function getTimePart(value) {
  const matchedTime = String(value ?? "").match(/(\d{2}:\d{2}(?::\d{2})?)/);
  return matchedTime?.[1] ?? null;
}

function requireRental(rentalId) {
  const rental = mockRentals.find(
    (candidate) => candidate.rentalId === String(rentalId),
  );

  if (!rental) {
    throw createMockError(
      "대여내역을 찾을 수 없습니다.",
      "STUDENT_RENTAL_NOT_FOUND",
    );
  }

  return rental;
}

function replaceRental(nextRental) {
  mockRentals = mockRentals.map((rental) =>
    rental.rentalId === nextRental.rentalId ? nextRental : rental,
  );

  return clone(nextRental);
}

function toAdminApprovalRecord(rental) {
  return {
    id: rental.rentalId,
    rentalId: rental.rentalId,
    studentName: rental.studentName,
    studentId: rental.studentId,
    department: rental.department,
    category: rental.category,
    equipmentName: rental.equipmentName,
    reason: rental.reason,
    rentalType: rental.rentalType,
    startDate: getDatePart(rental.expectedPickupAt),
    endDate: getDatePart(rental.expectedReturnAt),
    requestedDate: getDatePart(rental.requestedAt),
    requestedTime: getTimePart(rental.requestedAt),
  };
}

function toAdminStatusRecord(rental) {
  const status = rental.status === "pickupPending" ? "waiting" : rental.status;
  const isWaiting = status === "waiting";

  return {
    ...clone(rental),
    id: rental.rentalId,
    status,
    accessories: rental.components,
    ariaLabel: `${status === "overdue" ? "연체" : isWaiting ? "수령대기" : "대여중"} 대여 카드`,
    infoFields: isWaiting
      ? [
          {
            id: "student",
            label: "학생 정보",
            value: `${rental.studentName} (${rental.studentId})`,
          },
          {
            id: "scheduled-pickup",
            label: "수령 예정일",
            value: rental.expectedPickupAt,
            underlined: true,
          },
          {
            id: "scheduled-return",
            label: "반납 예정일",
            value: rental.expectedReturnAt,
          },
          { id: "rental-reason", label: "대여 사유", value: rental.reason },
        ]
      : [
          {
            id: "student",
            label: "학생 정보",
            value: `${rental.studentName} (${rental.studentId})`,
          },
          {
            id: "rental-requested-at",
            label: "대여 신청일",
            value: rental.requestedAt,
          },
          {
            id: "picked-up-at",
            label: "수령일",
            value: rental.actualPickupAt,
          },
          {
            id: "scheduled-return",
            label: "반납 예정일",
            value: rental.expectedReturnAt,
            underlined: true,
            tone: status === "overdue" ? "danger" : undefined,
          },
        ],
  };
}

function toHistoryRecord(rental) {
  return {
    id: rental.rentalId,
    rentalId: rental.rentalId,
    status: rental.status,
    imageSrc: rental.imageUrl,
    equipmentName: rental.equipmentName,
    modelName: rental.modelName,
    category: rental.category,
    os: rental.os,
    assetNumber: rental.assetNumber,
    studentName: rental.studentName,
    studentId: rental.studentId,
    department: rental.department,
    rentalType: rental.rentalType,
    requestedDate: getDatePart(rental.requestedAt),
    pickupDate: getDatePart(rental.actualPickupAt),
    returnedDate: getDatePart(rental.actualReturnAt),
  };
}

function toMemberRentalRecord(rental) {
  return {
    id: rental.rentalId,
    rentalId: rental.rentalId,
    imageSrc: rental.imageUrl,
    equipmentName: rental.equipmentName,
    modelName: rental.modelName,
    category: rental.category,
    os: rental.os,
    assetNumber: rental.assetNumber,
    rentalType: rental.rentalType,
    requestedDate: getDatePart(rental.requestedAt),
    pickupDate: getDatePart(rental.actualPickupAt),
    returnedDate: getDatePart(rental.actualReturnAt),
    status: rental.status === "renting" ? "rented" : rental.status,
  };
}

function matchesKeyword(rental, keyword) {
  const normalizedKeyword = String(keyword ?? "").trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  return [
    rental.equipmentName,
    rental.category,
    rental.rentalId,
    rental.assetNumber,
  ].some((value) => String(value ?? "").toLowerCase().includes(normalizedKeyword));
}

export async function queryMockStudentRentals({
  keyword = "",
  page = 0,
  size = 50,
  status = "all",
  signal,
} = {}) {
  await waitForMock(signal);

  const filteredRentals = mockRentals.filter(
    (rental) =>
      String(rental.userId) === String(MOCK_CURRENT_STUDENT.userId) &&
      rental.status !== "rejected" &&
      matchesStatus(rental.status, status) &&
      matchesKeyword(rental, keyword),
  );
  const resolvedPage = Number.isInteger(page) && page >= 0 ? page : 0;
  const resolvedSize = Number.isInteger(size) && size > 0 ? size : 50;
  const totalElements = filteredRentals.length;
  const totalPages = Math.ceil(totalElements / resolvedSize);
  const startIndex = resolvedPage * resolvedSize;

  return {
    content: clone(
      filteredRentals.slice(startIndex, startIndex + resolvedSize),
    ),
    page: resolvedPage,
    size: resolvedSize,
    totalElements,
    totalPages,
    hasNext: resolvedPage + 1 < totalPages,
  };
}

export async function getMockStudentRentalCounts({ signal } = {}) {
  await waitForMock(signal);

  const studentRentals = mockRentals.filter(
    (rental) =>
      String(rental.userId) === String(MOCK_CURRENT_STUDENT.userId) &&
      rental.status !== "rejected",
  );

  return {
    all: studentRentals.length,
    approvalPending: studentRentals.filter(
      (rental) => rental.status === "approvalPending",
    ).length,
    pickupPending: studentRentals.filter(
      (rental) => rental.status === "pickupPending",
    ).length,
    renting: studentRentals.filter(
      (rental) => rental.status === "renting" || rental.status === "overdue",
    ).length,
    overdue: studentRentals.filter((rental) => rental.status === "overdue")
      .length,
    canceled: studentRentals.filter((rental) => rental.status === "canceled")
      .length,
    returned: studentRentals.filter((rental) => rental.status === "returned")
      .length,
  };
}

export async function getMockStudentRentalDetail(rentalId, { signal } = {}) {
  await waitForMock(signal);

  const rental = mockRentals.find(
    (candidate) =>
      candidate.rentalId === String(rentalId) &&
      String(candidate.userId) === String(MOCK_CURRENT_STUDENT.userId) &&
      candidate.status !== "rejected",
  );

  if (!rental) {
    throw createMockError(
      "대여내역을 찾을 수 없습니다.",
      "STUDENT_RENTAL_NOT_FOUND",
    );
  }

  return clone(rental);
}

export async function cancelMockStudentRental({ rentalId, reason }) {
  await waitForMock();

  const rentalIndex = mockRentals.findIndex(
    (candidate) => candidate.rentalId === String(rentalId),
  );

  if (rentalIndex < 0) {
    throw createMockError(
      "대여내역을 찾을 수 없습니다.",
      "STUDENT_RENTAL_NOT_FOUND",
    );
  }

  const rental = mockRentals[rentalIndex];

  if (String(rental.userId) !== String(MOCK_CURRENT_STUDENT.userId)) {
    throw createMockError(
      "현재 학생의 대여 신청만 취소할 수 있습니다.",
      "STUDENT_RENTAL_NOT_FOUND",
    );
  }

  if (rental.status !== "approvalPending") {
    throw createMockError(
      "승인대기 상태의 신청만 취소할 수 있습니다.",
      "STUDENT_RENTAL_NOT_CANCELABLE",
    );
  }

  if (!MOCK_STUDENT_RENTAL_CANCEL_REASONS.includes(reason)) {
    throw createMockError(
      "신청 취소 사유를 선택해 주세요.",
      "STUDENT_RENTAL_CANCEL_REASON_REQUIRED",
    );
  }

  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const canceledAt = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}. ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const canceledRental = {
    ...rental,
    status: "canceled",
    canceledAt,
    cancelReason: reason,
  };

  mockRentals = mockRentals.map((candidate, index) =>
    index === rentalIndex ? canceledRental : candidate,
  );

  return clone(canceledRental);
}

export async function createMockStudentRental({
  model,
  user,
  rentalType,
  pickupDate,
  pickupTime,
  returnDate,
  returnTime,
  reason,
}) {
  await waitForMock();

  if (
    !model?.modelId ||
    !user?.id ||
    !rentalType ||
    !pickupDate ||
    !pickupTime ||
    !returnDate ||
    !returnTime ||
    !String(reason ?? "").trim()
  ) {
    throw createMockError(
      "대여 신청 정보를 모두 입력해 주세요.",
      "STUDENT_RENTAL_APPLICATION_REQUIRED",
    );
  }

  const now = new Date();
  const rental = {
    rentalId: `R${now.getTime()}`,
    userId: user.id,
    studentId: user.studentId ?? user.loginId ?? "",
    studentName: user.name ?? "",
    studentEmail: user.email ?? "",
    studentPhone: user.phoneNumber ?? "",
    college: user.college ?? "",
    department: user.department ?? "",
    modelId: model.modelId,
    itemId: null,
    assetNumber: null,
    labelNumber: null,
    status: "approvalPending",
    category: model.category,
    equipmentName: model.modelName,
    modelName: model.modelName,
    os: null,
    imageUrl: model.modelImageUrl ?? null,
    description: model.description ?? "",
    components: model.components ?? "",
    rentalType: rentalType === "long" ? "장기" : "단기",
    requestedAt: formatMockDateTime(now),
    expectedPickupAt: formatInputDateTime(pickupDate, pickupTime),
    expectedReturnAt: formatInputDateTime(returnDate, returnTime),
    reason: String(reason).trim(),
    approvedAt: null,
    actualPickupAt: null,
    actualReturnAt: null,
    canceledAt: null,
    cancelReason: null,
    rejectedAt: null,
    rejectionReason: null,
    checkoutPhotoUrl: null,
    returnPhotoUrl: null,
    pledgeUrl: null,
  };

  mockRentals = [rental, ...mockRentals];

  return clone(rental);
}

export async function queryMockAdminRentalApprovals({
  keyword = "",
  page = 0,
  size = 10,
  signal,
} = {}) {
  await waitForMock(signal);
  const normalizedKeyword = normalizeSearch(keyword);
  const records = mockRentals
    .filter((rental) => rental.status === "approvalPending")
    .filter(
      (rental) =>
        !normalizedKeyword ||
        [rental.studentName, rental.studentId, rental.equipmentName].some(
          (value) => normalizeSearch(value).includes(normalizedKeyword),
        ),
    )
    .sort((first, second) =>
      String(second.requestedAt).localeCompare(String(first.requestedAt)),
    )
    .map(toAdminApprovalRecord);

  return toPage(records, page, size);
}

export async function approveMockRental({ rentalId }) {
  await waitForMock();
  const rental = requireRental(rentalId);

  if (rental.status !== "approvalPending") {
    throw createMockError(
      "승인대기 상태의 신청만 승인할 수 있습니다.",
      "RENTAL_NOT_APPROVABLE",
    );
  }

  return replaceRental({
    ...rental,
    status: "pickupPending",
    approvedAt: formatMockDateTime(),
    itemId: rental.itemId ?? `mock-item-${rental.rentalId}`,
    assetNumber: rental.assetNumber ?? `MOCK-${rental.rentalId.slice(-6)}`,
  });
}

export async function rejectMockRental({ rentalId, reason }) {
  await waitForMock();
  const rental = requireRental(rentalId);

  if (rental.status !== "approvalPending") {
    throw createMockError(
      "승인대기 상태의 신청만 반려할 수 있습니다.",
      "RENTAL_NOT_REJECTABLE",
    );
  }

  if (!reason) {
    throw createMockError("반려 사유를 선택해 주세요.", "REJECTION_REQUIRED");
  }

  return replaceRental({
    ...rental,
    status: "rejected",
    rejectedAt: formatMockDateTime(),
    rejectionReason: reason,
  });
}

export async function queryMockAdminRentalStatuses({
  keyword = "",
  page = 0,
  size = 10,
  status = "all",
  signal,
} = {}) {
  await waitForMock(signal);
  const normalizedKeyword = normalizeSearch(keyword);
  const records = mockRentals
    .filter((rental) => {
      if (status === "waiting") {
        return rental.status === "pickupPending";
      }

      if (status === "renting") {
        return rental.status === "renting" || rental.status === "overdue";
      }

      return ["pickupPending", "renting", "overdue"].includes(rental.status);
    })
    .filter(
      (rental) =>
        !normalizedKeyword ||
        [
          rental.equipmentName,
          rental.studentName,
          rental.studentId,
          rental.assetNumber,
        ].some((value) => normalizeSearch(value).includes(normalizedKeyword)),
    )
    .sort((first, second) => {
      if (status === "renting") {
        return Number(second.status === "overdue") - Number(first.status === "overdue");
      }

      return String(second.requestedAt).localeCompare(String(first.requestedAt));
    })
    .map(toAdminStatusRecord);

  return toPage(records, page, size);
}

export async function getMockAdminRentalStatusCounts({ signal } = {}) {
  await waitForMock(signal);
  const waiting = mockRentals.filter(
    (rental) => rental.status === "pickupPending",
  ).length;
  const renting = mockRentals.filter(
    (rental) => rental.status === "renting" || rental.status === "overdue",
  ).length;
  const overdue = mockRentals.filter(
    (rental) => rental.status === "overdue",
  ).length;

  return { all: waiting + renting, waiting, renting, overdue };
}

export async function pickupMockRental({ rentalId, processPhoto, workerName }) {
  await waitForMock();
  const rental = requireRental(rentalId);

  if (rental.status !== "pickupPending") {
    throw createMockError(
      "수령대기 상태의 대여만 수령 처리할 수 있습니다.",
      "RENTAL_NOT_PICKUP_PENDING",
    );
  }

  if (!processPhoto) {
    throw createMockError("수령 사진을 선택해 주세요.", "PHOTO_REQUIRED");
  }

  return replaceRental({
    ...rental,
    status: "renting",
    actualPickupAt: formatMockDateTime(),
    checkoutPhotoName: processPhoto.name,
    pickupWorkerName: workerName ?? "",
  });
}

export async function returnMockRental({ rentalId, processPhoto, workerName }) {
  await waitForMock();
  const rental = requireRental(rentalId);

  if (rental.status !== "renting" && rental.status !== "overdue") {
    throw createMockError(
      "대여중 또는 연체 상태의 대여만 반납 처리할 수 있습니다.",
      "RENTAL_NOT_RETURNABLE",
    );
  }

  if (!processPhoto) {
    throw createMockError("반납 사진을 선택해 주세요.", "PHOTO_REQUIRED");
  }

  return replaceRental({
    ...rental,
    status: "returned",
    actualReturnAt: formatMockDateTime(),
    returnPhotoName: processPhoto.name,
    returnWorkerName: workerName ?? "",
  });
}

export async function queryMockAdminRentalHistory({
  keyword = "",
  page = 0,
  size = 10,
  status = "all",
  signal,
} = {}) {
  await waitForMock(signal);
  const normalizedKeyword = normalizeSearch(keyword);
  const records = mockRentals
    .filter(
      (rental) =>
        ["canceled", "returned"].includes(rental.status) &&
        (status === "all" || rental.status === status),
    )
    .filter(
      (rental) =>
        !normalizedKeyword ||
        [
          rental.equipmentName,
          rental.modelName,
          rental.assetNumber,
          rental.studentName,
          rental.studentId,
        ].some((value) => normalizeSearch(value).includes(normalizedKeyword)),
    )
    .sort((first, second) =>
      String(second.requestedAt).localeCompare(String(first.requestedAt)),
    )
    .map(toHistoryRecord);

  return toPage(records, page, size);
}

export async function getMockAdminRentalHistoryCounts({ signal } = {}) {
  await waitForMock(signal);
  const history = mockRentals.filter((rental) =>
    ["canceled", "returned"].includes(rental.status),
  );

  return {
    all: history.length,
    canceled: history.filter((rental) => rental.status === "canceled").length,
    returned: history.filter((rental) => rental.status === "returned").length,
  };
}

export async function getMockAdminRentalDashboard({ signal } = {}) {
  await waitForMock(signal);
  const today = getDatePart(formatMockDateTime());

  return {
    waitingApproval: mockRentals.filter(
      (rental) => rental.status === "approvalPending",
    ).length,
    todayPickup: mockRentals.filter(
      (rental) =>
        rental.status === "pickupPending" &&
        getDatePart(rental.expectedPickupAt) === today,
    ).length,
    todayReturn: mockRentals.filter(
      (rental) =>
        (rental.status === "renting" || rental.status === "overdue") &&
        getDatePart(rental.expectedReturnAt) === today,
    ).length,
    overdue: mockRentals.filter((rental) => rental.status === "overdue").length,
  };
}

export async function queryMockMemberRentalHistory({
  memberId,
  keyword = "",
  page = 0,
  size = 10,
  signal,
} = {}) {
  await waitForMock(signal);
  const normalizedKeyword = normalizeSearch(keyword);
  const records = mockRentals
    .filter(
      (rental) =>
        String(rental.userId) === String(memberId) &&
        rental.status !== "rejected",
    )
    .filter(
      (rental) =>
        !normalizedKeyword ||
        [rental.equipmentName, rental.modelName, rental.assetNumber].some(
          (value) => normalizeSearch(value).includes(normalizedKeyword),
        ),
    )
    .map(toMemberRentalRecord);

  return toPage(records, page, size);
}

export function getMockMemberRentalCount(memberId) {
  return mockRentals.filter(
    (rental) =>
      String(rental.userId) === String(memberId) && rental.status !== "rejected",
  ).length;
}
