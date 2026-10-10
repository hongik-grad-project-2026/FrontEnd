// 이 상태값은 학생 대여 화면을 확인하기 위한 mock 전용 계약이야.
// 실제 서버 상태값은 대여 API가 Swagger에 추가된 뒤 별도로 변환해야 해.
export const MOCK_STUDENT_RENTAL_STATUSES = Object.freeze([
  "approvalPending",
  "pickupPending",
  "renting",
  "overdue",
  "canceled",
  "returned",
]);

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

let studentRentals = structuredClone(INITIAL_STUDENT_RENTALS);

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

  const filteredRentals = studentRentals.filter(
    (rental) =>
      matchesStatus(rental.status, status) && matchesKeyword(rental, keyword),
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

  const rental = studentRentals.find(
    (candidate) => candidate.rentalId === String(rentalId),
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

  const rentalIndex = studentRentals.findIndex(
    (candidate) => candidate.rentalId === String(rentalId),
  );

  if (rentalIndex < 0) {
    throw createMockError(
      "대여내역을 찾을 수 없습니다.",
      "STUDENT_RENTAL_NOT_FOUND",
    );
  }

  const rental = studentRentals[rentalIndex];

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

  studentRentals = studentRentals.map((candidate, index) =>
    index === rentalIndex ? canceledRental : candidate,
  );

  return clone(canceledRental);
}
