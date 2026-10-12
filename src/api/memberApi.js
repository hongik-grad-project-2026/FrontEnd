import { api, isMockMode } from "./client";
import { getMemberRentalHistory } from "./rentalApi";

// 화면 확인용 임시 데이터임.
// 실제 서버 응답 구조가 아니다.
//
// id는 회원 구분용 임시 고유 ID임.
// studentId는 화면 표시 및 검색용 학번임.
// listGroup은 mock 전용 상호 배타적 탭 분류임.
// membershipStatus는 회원 배지 표시용 상태임.
export const MOCK_MEMBERS = [
  {
    id: 1,
    name: "가상학생가",
    studentId: "C000001",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student01@example.com",
  },
  {
    id: 2,
    name: "가상학생나",
    studentId: "C000002",
    department: "기계·시스템디자인공학과",
    listGroup: "blacklist",
    membershipStatus: "blacklist",
    phone: "010-0000-0000",
    email: "student02@example.com",
  },
  {
    id: 3,
    name: "가상학생다",
    studentId: "C000003",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student03@example.com",
  },
  {
    id: 4,
    name: "가상학생라",
    studentId: "C000004",
    department: "시각디자인과",
    listGroup: "other",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student04@example.com",
  },
  {
    id: 5,
    name: "가상학생마",
    studentId: "C000005",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student05@example.com",
  },
  {
    id: 6,
    name: "가상학생바",
    studentId: "C000006",
    department: "컴퓨터공학과",
    listGroup: "blacklist",
    membershipStatus: "blacklist",
    phone: "010-0000-0000",
    email: "student06@example.com",
  },
  {
    id: 7,
    name: "가상학생사",
    studentId: "C000007",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student07@example.com",
  },
  {
    id: 8,
    name: "가상학생아",
    studentId: "C000008",
    department: "경영학과",
    listGroup: "other",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student08@example.com",
  },
  {
    id: 9,
    name: "가상학생자",
    studentId: "C000009",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student09@example.com",
  },
  {
    id: 10,
    name: "가상학생차",
    studentId: "C000010",
    department: "컴퓨터공학과",
    listGroup: "blacklist",
    membershipStatus: "blacklist",
    phone: "010-0000-0000",
    email: "student10@example.com",
  },
  {
    id: 11,
    name: "긴이름표시확인용가상학생",
    studentId: "C000011",
    department: "긴 학과명 표시 확인용 가상 학과 및 융합전공",
    status: "WITHDRAWN",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "long-email-address-for-layout-check@example.com",
  },
];

// 화면 확인용 블랙리스트 기록임.
// 실제 서버 상태·기간 규칙이 아니다.
const MOCK_BLACKLIST_HISTORY_BY_MEMBER_ID = {
  1: [
    {
      id: "mock-blacklist-001",
      startDate: "2026.08.01",
      endDate: "2026.08.31",
      reason: "화면 확인용 장기 연체 기록",
    },
    {
      id: "mock-blacklist-002",
      startDate: "2026.05.10",
      endDate: "2026.05.24",
      reason: "화면 확인용 기자재 파손 기록",
    },
    {
      id: "mock-blacklist-003",
      startDate: "2026.03.02",
      endDate: "2026.03.16",
      reason: "화면 확인용 반납 지연 기록",
    },
    {
      id: "mock-blacklist-004",
      startDate: "2025.12.01",
      endDate: "2025.12.15",
      reason: "화면 확인용 연락 지연 기록",
    },
    {
      id: "mock-blacklist-005",
      startDate: "2025.09.10",
      endDate: "2025.09.24",
      reason: "화면 확인용 대여 규정 위반 기록",
    },
    {
      id: "mock-blacklist-006",
      startDate: "2025.06.03",
      endDate: "2025.06.17",
      reason: "화면 확인용 연체 기록",
    },
  ],
  2: [
    {
      id: "mock-blacklist-007",
      startDate: "2026.09.01",
      endDate: "2026.09.30",
      reason: "화면 확인용 현재 블랙리스트 기록",
    },
  ],
};

// 화면 확인용 회원별 대여 내역임.
// 실제 서버 응답이나 업무 상태 코드가 아니다.
const MOCK_MEMBER_RENTALS_BY_MEMBER_ID = {
  1: [
    {
      id: "mock-member-rental-001",
      imageSrc: null,
      equipmentName: "화면 확인용 노트북 A",
      modelName: "MOCK-LAPTOP-A",
      category: "노트북",
      os: "Windows",
      assetNumber: null,
      rentalType: "장기",
      requestedDate: "2026.09.18",
      pickupDate: null,
      returnedDate: null,
      status: "approvalPending",
    },
    {
      id: "mock-member-rental-002",
      imageSrc: null,
      equipmentName: "화면 확인용 태블릿 A",
      modelName: "MOCK-TABLET-A",
      category: "태블릿",
      os: "Android",
      assetNumber: "MOCK-ASSET-0002",
      rentalType: "장기",
      requestedDate: "2026.09.10",
      pickupDate: "2026.09.11",
      returnedDate: null,
      status: "rented",
    },
    {
      id: "mock-member-rental-003",
      imageSrc: null,
      equipmentName: "화면 확인용 카메라 A",
      modelName: "MOCK-CAMERA-A",
      category: "카메라",
      os: null,
      assetNumber: "MOCK-ASSET-0003",
      rentalType: "단기",
      requestedDate: "2026.08.28",
      pickupDate: "2026.08.29",
      returnedDate: null,
      status: "overdue",
    },
    {
      id: "mock-member-rental-004",
      imageSrc: null,
      equipmentName: "화면 확인용 키보드·마우스 A",
      modelName: "MOCK-INPUT-A",
      category: "키보드·마우스",
      os: null,
      assetNumber: "MOCK-ASSET-0004",
      rentalType: "장기",
      requestedDate: "2026.08.20",
      pickupDate: "2026.08.21",
      returnedDate: "2026.08.28",
      status: "returned",
    },
    {
      id: "mock-member-rental-005",
      imageSrc: null,
      equipmentName: "화면 확인용 노트북 거치대",
      modelName: "MOCK-STAND-A",
      category: "노트북 거치대",
      os: null,
      assetNumber: null,
      rentalType: "단기",
      requestedDate: "2026.08.15",
      pickupDate: null,
      returnedDate: null,
      status: "canceled",
    },
    {
      id: "mock-member-rental-006",
      imageSrc: null,
      equipmentName: "화면 확인용 노트북 B",
      modelName: "MOCK-LAPTOP-B",
      category: "노트북",
      os: "Windows",
      assetNumber: "MOCK-ASSET-0006",
      rentalType: "장기",
      requestedDate: "2026.08.10",
      pickupDate: null,
      returnedDate: null,
      status: "pickupPending",
    },
    {
      id: "mock-member-rental-007",
      imageSrc: null,
      equipmentName: "화면 확인용 태블릿 B",
      modelName: "MOCK-TABLET-B",
      category: "태블릿",
      os: "iPadOS",
      assetNumber: "MOCK-ASSET-0007",
      rentalType: "단기",
      requestedDate: "2026.07.20",
      pickupDate: "2026.07.21",
      returnedDate: "2026.07.25",
      status: "returned",
    },
    {
      id: "mock-member-rental-008",
      imageSrc: null,
      equipmentName: "화면 확인용 보조배터리",
      modelName: "MOCK-BATTERY-A",
      category: "보조배터리",
      os: null,
      assetNumber: "MOCK-ASSET-0008",
      rentalType: "단기",
      requestedDate: "2026.07.01",
      pickupDate: "2026.07.02",
      returnedDate: "2026.07.04",
      status: "returned",
    },
    {
      id: "mock-member-rental-009",
      imageSrc: null,
      equipmentName: "화면 확인용 모니터",
      modelName: "MOCK-MONITOR-A",
      category: "모니터",
      os: null,
      assetNumber: "MOCK-ASSET-0009",
      rentalType: "장기",
      requestedDate: "2026.06.10",
      pickupDate: "2026.06.11",
      returnedDate: "2026.06.25",
      status: "returned",
    },
    {
      id: "mock-member-rental-010",
      imageSrc: null,
      equipmentName: "화면 확인용 카메라 삼각대",
      modelName: "MOCK-TRIPOD-A",
      category: "촬영 장비",
      os: null,
      assetNumber: null,
      rentalType: "단기",
      requestedDate: "2026.05.15",
      pickupDate: null,
      returnedDate: null,
      status: "canceled",
    },
    {
      id: "mock-member-rental-011",
      imageSrc: null,
      equipmentName: "긴 기자재명과 말줄임 표시 확인용 노트북",
      modelName: "MOCK-LONG-LAPTOP-MODEL-NAME",
      category: "노트북",
      os: "Linux",
      assetNumber: "MOCK-ASSET-LONG-0011",
      rentalType: "장기",
      requestedDate: "2026.04.01",
      pickupDate: "2026.04.02",
      returnedDate: "2026.04.30",
      status: "returned",
    },
  ],
  2: [
    {
      id: "mock-member-rental-012",
      imageSrc: null,
      equipmentName: "화면 확인용 태블릿 C",
      modelName: "MOCK-TABLET-C",
      category: "태블릿",
      os: "Android",
      assetNumber: "MOCK-ASSET-0012",
      rentalType: "장기",
      requestedDate: "2026.08.01",
      pickupDate: "2026.08.02",
      returnedDate: null,
      status: "overdue",
    },
    {
      id: "mock-member-rental-013",
      imageSrc: null,
      equipmentName: "화면 확인용 충전기",
      modelName: "MOCK-CHARGER-A",
      category: "충전 장비",
      os: null,
      assetNumber: "MOCK-ASSET-0013",
      rentalType: "단기",
      requestedDate: "2026.07.01",
      pickupDate: "2026.07.02",
      returnedDate: "2026.07.05",
      status: "returned",
    },
  ],
};

function normalizeSearch(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getMemberRentals(memberId) {
  return MOCK_MEMBER_RENTALS_BY_MEMBER_ID[memberId] ?? [];
}

function findMember(memberId) {
  return MOCK_MEMBERS.find((member) => String(member.id) === String(memberId));
}

function createMemberNotFoundError(memberId) {
  const error = new Error("회원을 찾을 수 없습니다.");

  error.code = "MEMBER_NOT_FOUND";
  error.memberId = memberId;

  return error;
}

function requireMember(memberId) {
  const member = findMember(memberId);

  if (!member) {
    throw createMemberNotFoundError(memberId);
  }

  return member;
}

function requireMockOnlyFeature() {
  if (isMockMode) {
    return;
  }

  const error = new Error("현재 백엔드에서 제공하지 않는 회원 기능입니다.");
  error.code = "API_NOT_SUPPORTED";
  throw error;
}

function createUnsupportedError(message) {
  const error = new Error(message);
  error.code = "API_NOT_SUPPORTED";
  return error;
}

export function getAdminMemberCapabilities() {
  return {
    canFilterOtherDepartment: isMockMode,
    canUpdateStatus: isMockMode,
  };
}

function getMockMemberStatus(member) {
  if (["ACTIVE", "SUSPENDED", "WITHDRAWN"].includes(member.status)) {
    return member.status;
  }

  return member.listGroup === "blacklist" ? "SUSPENDED" : "ACTIVE";
}

function toMockMemberContract(member) {
  return {
    userId: member.id,
    loginId: member.studentId,
    studentId: member.studentId,
    name: member.name,
    email: member.email,
    phoneNumber: member.phone,
    college: member.college ?? "공과대학",
    department: member.department,
    role: "STUDENT",
    status: getMockMemberStatus(member),
    profileImageUrl: member.profileImageUrl ?? null,
  };
}

function resolvePage(page, totalPages) {
  const requestedPage = Number.isInteger(page) && page >= 0 ? page : 0;

  return Math.min(requestedPage, Math.max(0, totalPages - 1));
}

function resolveSize(size, defaultSize) {
  return Number.isInteger(size) && size > 0 ? size : defaultSize;
}

function createPage(content, page, size) {
  const totalElements = content.length;
  const totalPages = Math.ceil(totalElements / size);
  const resolvedPage = resolvePage(page, totalPages);
  const startIndex = resolvedPage * size;

  return {
    content: content.slice(startIndex, startIndex + size),
    page: resolvedPage,
    size,
    totalElements,
    totalPages,
  };
}

function toMembershipStatus(status) {
  if (status === "ACTIVE") {
    return "active";
  }

  if (status === "SUSPENDED") {
    return "suspended";
  }

  if (status === "WITHDRAWN") {
    return "withdrawn";
  }

  return "unknown";
}

function toMemberListItem(member) {
  return {
    id: member.userId,
    userId: member.userId,
    loginId: member.loginId ?? null,
    name: member.name,
    studentId: member.studentId,
    college: member.college,
    department: member.department,
    status: member.status,
    membershipStatus: toMembershipStatus(member.status),
    phone: member.phoneNumber,
    email: member.email,
    createdAt: member.createdAt ?? null,
  };
}

function toMemberDetail(member) {
  return {
    id: member.userId,
    userId: member.userId,
    loginId: member.loginId,
    name: member.name,
    studentId: member.studentId,
    college: member.college,
    department: member.department,
    status: member.status,
    membershipStatus: toMembershipStatus(member.status),
    phone: member.phoneNumber,
    email: member.email,
    profileImageSrc:
      member.profileImageUrl || "/images/hongikLogo-circle.png",
    createdAt: member.createdAt ?? null,
    updatedAt: member.updatedAt ?? null,
  };
}

function getMockMembersByOtherDepartment({
  keyword,
  status,
  currentDepartment,
  page,
  size,
}) {
  requireMockOnlyFeature();

  if (!currentDepartment) {
    throw createUnsupportedError("관리자 소속 학과 정보를 확인할 수 없습니다.");
  }

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredMembers = MOCK_MEMBERS.map(toMockMemberContract).filter((member) => {
    const matchesKeyword =
      !normalizedKeyword ||
      member.name.toLowerCase().includes(normalizedKeyword) ||
      member.studentId.toLowerCase().includes(normalizedKeyword);
    const matchesStatus = !status || member.status === status;
    const isOtherDepartment = member.department !== currentDepartment;

    return matchesKeyword && matchesStatus && isOtherDepartment;
  });
  const memberPage = createPage(filteredMembers, page, size);

  return {
    ...memberPage,
    content: memberPage.content.map(toMemberListItem),
    hasNext: memberPage.page + 1 < memberPage.totalPages,
  };
}

export async function getAdminMembers({
  keyword = "",
  status = "",
  college = "",
  department = "",
  affiliation = "all",
  currentCollege = "",
  currentDepartment = "",
  page = 0,
  size = 10,
  signal,
} = {}) {
  if (affiliation === "other") {
    if (!isMockMode) {
      throw createUnsupportedError(
        "현재 서버 API에서 타과생 전체 조회를 지원하지 않습니다.",
      );
    }

    return getMockMembersByOtherDepartment({
      keyword,
      status,
      currentDepartment,
      page,
      size,
    });
  }

  const resolvedCollege = affiliation === "own" ? currentCollege : college;
  const resolvedDepartment =
    affiliation === "own" ? currentDepartment : department;

  if (affiliation === "own" && !resolvedDepartment) {
    throw createUnsupportedError("관리자 소속 학과 정보를 확인할 수 없습니다.");
  }

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const optionalParams = {
    keyword,
    status,
    college: resolvedCollege,
    department: resolvedDepartment,
  };

  for (const [key, value] of Object.entries(optionalParams)) {
    const normalizedValue = value?.trim();

    if (normalizedValue) {
      params.set(key, normalizedValue);
    }
  }

  const result = await api.get(`/admin/users?${params.toString()}`, { signal });

  return {
    content: (result?.users ?? []).map(toMemberListItem),
    page: result?.page ?? page,
    size: result?.size ?? size,
    totalElements: result?.totalElements ?? 0,
    totalPages: result?.totalPages ?? 0,
    hasNext: result?.hasNext ?? false,
  };
}

export async function getAdminStaffMembers(options) {
  const result = await api.get("/admin/users/staff", options);

  return (result ?? []).map((staff) => ({
    id: staff.userId,
    userId: staff.userId,
    loginId: staff.loginId,
    name: staff.name,
  }));
}

export async function getAdminMemberDetail(userId, options) {
  const result = await api.get(
    `/admin/users/${encodeURIComponent(userId)}`,
    options,
  );

  return toMemberDetail(result);
}

export async function updateAdminMember(userId, fields, options) {
  const allowedFields = [
    "name",
    "email",
    "phoneNumber",
    "college",
    "department",
  ];
  const body = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(fields, field)) {
      body[field] = fields[field];
    }
  }

  const result = await api.patch(
    `/admin/users/${encodeURIComponent(userId)}`,
    body,
    options,
  );

  return toMemberDetail(result);
}

export async function updateAdminMemberStatus(userId, status) {
  if (!isMockMode) {
    throw createUnsupportedError(
      "현재 서버 API에서 회원 상태 변경을 지원하지 않습니다.",
    );
  }

  if (!["ACTIVE", "SUSPENDED"].includes(status)) {
    const error = new Error("지원하지 않는 회원 상태입니다.");
    error.code = "INVALID_MEMBER_STATUS";
    throw error;
  }

  const member = requireMember(userId);
  member.status = status;
  member.listGroup = status === "SUSPENDED" ? "blacklist" : "normal";
  member.membershipStatus =
    status === "SUSPENDED" ? "blacklist" : "normal";

  return toMemberDetail(toMockMemberContract(member));
}

// 회원별 블랙리스트 기록을 임시 조회함.
export async function getAdminMemberBlacklistHistory({
  memberId,
  page = 0,
  size = 5,
} = {}) {
  requireMockOnlyFeature();
  requireMember(memberId);

  const resolvedSize = resolveSize(size, 5);
  const records = MOCK_BLACKLIST_HISTORY_BY_MEMBER_ID[memberId] ?? [];
  const recordPage = createPage(records, page, resolvedSize);

  return {
    ...recordPage,
    content: recordPage.content.map((record, index) => ({
      ...record,
      number:
        recordPage.totalElements - (recordPage.page * recordPage.size + index),
    })),
  };
}

// 회원별 대여 내역을 임시 조회함.
// keyword 검색 필드는 화면 확인용 임시 규칙임.
export async function getAdminMemberRentalHistory({
  memberId,
  page = 0,
  size = 10,
  keyword = "",
} = {}) {
  requireMockOnlyFeature();
  requireMember(memberId);
  return getMemberRentalHistory(memberId, {
    page,
    size: resolveSize(size, 10),
    keyword,
  });
}
