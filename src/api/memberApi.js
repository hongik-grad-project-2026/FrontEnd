// 화면 확인용 임시 데이터
// 실제 서버 응답 구조 아님
//
// id: 회원 구분용 임시 고유 ID
// studentId: 화면 표시 및 검색용 학번
// listGroup: 목업 전용 상호 배타적 탭 분류
// membershipStatus: 회원 배지 표시용 상태
const MOCK_MEMBERS = [
  {
    id: "mock-member-001",
    name: "가상학생가",
    studentId: "C000001",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student01@example.com",
  },
  {
    id: "mock-member-002",
    name: "가상학생나",
    studentId: "C000002",
    department: "기계·시스템디자인공학과",
    listGroup: "blacklist",
    membershipStatus: "blacklist",
    phone: "010-0000-0000",
    email: "student02@example.com",
  },
  {
    id: "mock-member-003",
    name: "가상학생다",
    studentId: "C000003",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student03@example.com",
  },
  {
    id: "mock-member-004",
    name: "가상학생라",
    studentId: "C000004",
    department: "시각디자인과",
    listGroup: "other",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student04@example.com",
  },
  {
    id: "mock-member-005",
    name: "가상학생마",
    studentId: "C000005",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student05@example.com",
  },
  {
    id: "mock-member-006",
    name: "가상학생바",
    studentId: "C000006",
    department: "컴퓨터공학과",
    listGroup: "blacklist",
    membershipStatus: "blacklist",
    phone: "010-0000-0000",
    email: "student06@example.com",
  },
  {
    id: "mock-member-007",
    name: "가상학생사",
    studentId: "C000007",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student07@example.com",
  },
  {
    id: "mock-member-008",
    name: "가상학생아",
    studentId: "C000008",
    department: "경영학과",
    listGroup: "other",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student08@example.com",
  },
  {
    id: "mock-member-009",
    name: "가상학생자",
    studentId: "C000009",
    department: "컴퓨터공학과",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "student09@example.com",
  },
  {
    id: "mock-member-010",
    name: "가상학생차",
    studentId: "C000010",
    department: "컴퓨터공학과",
    listGroup: "blacklist",
    membershipStatus: "blacklist",
    phone: "010-0000-0000",
    email: "student10@example.com",
  },
  {
    id: "mock-member-011",
    name: "긴이름표시확인용가상학생",
    studentId: "C000011",
    department: "긴 학과명 표시 확인용 가상 학과 및 융합전공",
    listGroup: "normal",
    membershipStatus: "normal",
    phone: "010-0000-0000",
    email: "long-email-address-for-layout-check@example.com",
  },
];

// 화면 확인용 블랙리스트 기록
// 실제 서버 상태·기간 규칙 아님
const MOCK_BLACKLIST_HISTORY_BY_MEMBER_ID = {
  "mock-member-001": [
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
  "mock-member-002": [
    {
      id: "mock-blacklist-007",
      startDate: "2026.09.01",
      endDate: "2026.09.30",
      reason: "화면 확인용 현재 블랙리스트 기록",
    },
  ],
};

// 화면 확인용 회원별 대여 내역
// 실제 서버 응답·업무 상태 코드 아님
const MOCK_MEMBER_RENTALS_BY_MEMBER_ID = {
  "mock-member-001": [
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
  "mock-member-002": [
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
  return MOCK_MEMBERS.find((member) => member.id === memberId);
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

// 목업 데이터를 화면용 회원 목록 항목으로 변환
// 실제 연동 시 확정된 서버 필드·상태값에 맞춰 수정
function toMemberListItem(member) {
  return {
    id: member.id,
    name: member.name,
    studentId: member.studentId,
    department: member.department,
    membershipStatus: member.membershipStatus,
    phone: member.phone,
    email: member.email,
  };
}

function toMemberDetail(member) {
  return {
    id: member.id,
    name: member.name,
    studentId: member.studentId,
    department: member.department,
    membershipStatus: member.membershipStatus,
    phone: member.phone,
    email: member.email,
    profileImageSrc: "/images/hongikLogo-circle.png",
    rentalCount: getMemberRentals(member.id).length,
  };
}

// 프론트 내부 목록 조회 함수
// group, search: 실제 서버 요청 파라미터명 미확정
// page: 0부터 시작
export async function getAdminMembers({
  group = "all",
  search = "",
  page = 0,
  size = 10,
} = {}) {
  const resolvedSize = resolveSize(size, 10);
  const normalizedSearch = normalizeSearch(search);

  const filteredMembers = MOCK_MEMBERS.filter((member) => {
    const matchesGroup = group === "all" || member.listGroup === group;

    const matchesSearch =
      normalizedSearch === "" ||
      normalizeSearch(member.name).includes(normalizedSearch) ||
      normalizeSearch(member.studentId).includes(normalizedSearch);

    return matchesGroup && matchesSearch;
  });

  const memberPage = createPage(filteredMembers, page, resolvedSize);

  return {
    ...memberPage,
    content: memberPage.content.map(toMemberListItem),
  };
}

// 검색어·선택 탭·현재 페이지와 무관한 전체 기준 개수
export async function getAdminMemberCounts() {
  const counts = {
    all: MOCK_MEMBERS.length,
    normal: 0,
    blacklist: 0,
    other: 0,
  };

  for (const member of MOCK_MEMBERS) {
    switch (member.listGroup) {
      case "normal":
        counts.normal += 1;
        break;

      case "blacklist":
        counts.blacklist += 1;
        break;

      case "other":
        counts.other += 1;
        break;

      default:
        break;
    }
  }

  return counts;
}

// Breadcrumbs와 상세 라우트 제목용 임시 요약 조회
// 실제 연동 시 요약 API 존재 여부에 따라 상세 조회와 통합 가능
export async function getAdminMemberSummary(memberId) {
  const member = requireMember(memberId);

  return {
    id: member.id,
    name: member.name,
  };
}

// 회원 상세 임시 조회
export async function getAdminMemberDetail(memberId) {
  const member = requireMember(memberId);

  return toMemberDetail(member);
}

// 회원별 블랙리스트 기록 임시 조회
export async function getAdminMemberBlacklistHistory({
  memberId,
  page = 0,
  size = 5,
} = {}) {
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

// 회원별 대여 내역 임시 조회
// keyword 검색 필드는 화면 확인용 임시 규칙
export async function getAdminMemberRentalHistory({
  memberId,
  page = 0,
  size = 10,
  keyword = "",
} = {}) {
  requireMember(memberId);

  const resolvedSize = resolveSize(size, 10);
  const normalizedKeyword = normalizeSearch(keyword);

  const filteredRentals = getMemberRentals(memberId).filter((rental) => {
    if (!normalizedKeyword) {
      return true;
    }

    return [rental.equipmentName, rental.modelName, rental.assetNumber].some(
      (value) => normalizeSearch(value).includes(normalizedKeyword),
    );
  });

  return createPage(filteredRentals, page, resolvedSize);
}
