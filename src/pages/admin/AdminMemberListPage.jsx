import { useId, useState } from "react";

import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";
import Tabs from "../../components/common/Tabs";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";

import styles from "./AdminMemberListPage.module.css";

const PAGE_SIZE = 10;

const MEMBER_TABS = [
  { value: "all", label: "전체" },
  { value: "normal", label: "일반" },
  { value: "blacklist", label: "블랙리스트" },
  { value: "other", label: "타과생" },
];

const MEMBER_BADGE_STATUS = {
  normal: "회원-일반",
  blacklist: "회원-블랙",
};

// 화면 확인용 가상 데이터입니다. 실제 API 응답 구조가 아님
// id: 향후 상세 연결용 고유 ID
// studentId: 화면 표시 및 검색용 학번
// listGroup: 이번 목업에서만 사용하는 상호 배타적인 탭 분류
// membershipStatus: 일반회원 / 블랙리스트 배지 표시용 상태
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

function normalizeSearch(value) {
  return value.trim().toLowerCase();
}

function MemberNameCell({ member }) {
  return (
    <span className={styles.memberCell}>
      <span className={styles.avatar} aria-hidden="true">
        <span className={styles.userIcon} />
      </span>

      <span className={styles.memberName} title={member.name}>
        {member.name}
      </span>
    </span>
  );
}

function TextCell({ text }) {
  return (
    <span className={styles.singleLineText} title={text}>
      {text}
    </span>
  );
}

const MEMBER_COLUMNS = [
  {
    key: "name",
    header: "학생 이름",
    width: 164,
    render: (member) => <MemberNameCell member={member} />,
  },
  {
    key: "studentId",
    header: "학번",
    width: 148,
    render: (member) => <TextCell text={member.studentId} />,
  },
  {
    key: "department",
    header: "학과",
    width: 268,
    render: (member) => <TextCell text={member.department} />,
  },
  {
    key: "membershipStatus",
    header: "분류",
    width: 116,
    render: (member) => (
      <StatusBadge
        status={MEMBER_BADGE_STATUS[member.membershipStatus]}
        size="md"
      />
    ),
  },
  {
    key: "phone",
    header: "연락처",
    width: 156,
    render: (member) => <TextCell text={member.phone} />,
  },
  {
    key: "email",
    header: "이메일",
    width: 268,
    render: (member) => <TextCell text={member.email} />,
  },
];

function AdminMemberListPage() {
  const panelId = useId();

  const [selectedGroup, setSelectedGroup] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const tabItems = MEMBER_TABS.map((tab) => ({
    ...tab,
    count:
      tab.value === "all"
        ? MOCK_MEMBERS.length
        : MOCK_MEMBERS.filter((member) => member.listGroup === tab.value)
            .length,
    controlsId: panelId,
  }));

  const selectedTab = tabItems.find((tab) => tab.value === selectedGroup);

  const normalizedSearch = normalizeSearch(searchTerm);

  const filteredMembers = MOCK_MEMBERS.filter((member) => {
    const matchesGroup =
      selectedGroup === "all" || member.listGroup === selectedGroup;

    const matchesSearch =
      normalizedSearch === "" ||
      normalizeSearch(member.name).includes(normalizedSearch) ||
      normalizeSearch(member.studentId).includes(normalizedSearch);

    return matchesGroup && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));

  const resolvedCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (resolvedCurrentPage - 1) * PAGE_SIZE;
  const visibleMembers = filteredMembers.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const emptyMessage = normalizedSearch
    ? "검색 조건에 해당하는 회원이 없습니다."
    : "표시할 회원이 없습니다.";

  const handleGroupChange = (nextGroup) => {
    setSelectedGroup(nextGroup);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  // Enter와 검색 버튼도 동일한 검색어를 사용
  // SearchBar의 기본 alert가 실행되지 않도록 명시
  const handleSearchSubmit = (inputText) => {
    setSearchTerm(inputText);
    setCurrentPage(1);
  };

  return (
    <div className={styles.page}>
      <PageHeader />

      <div
        className={styles.contentViewport}
        role="region"
        aria-label="회원 목록 가로 스크롤 영역"
        tabIndex={0}
      >
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <Tabs
              className={styles.memberTabs}
              items={tabItems}
              value={selectedGroup}
              onChange={handleGroupChange}
              ariaLabel="회원 분류"
            />

            <SearchBar
              className={styles.search}
              width={360}
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              ariaLabel="회원 이름 또는 학번 검색"
              placeholder="이름 또는 학번으로 검색..."
            />
          </div>

          <div
            id={panelId}
            className={styles.tablePanel}
            role="tabpanel"
            aria-label={`${selectedTab?.label ?? "전체"} 회원 목록`}
          >
            {/* 상세 이동은 다음 작업에서 연결. */}
            <DataTable
              className={styles.dataTable}
              ariaLabel="회원 관리 목록"
              columns={MEMBER_COLUMNS}
              rows={visibleMembers}
              getRowId={(member) => member.id}
              minWidth={1120}
              emptyMessage={emptyMessage}
            />
          </div>

          <div className={styles.footer}>
            <Pagination
              page={resolvedCurrentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
              ariaLabel="회원 목록 페이지 이동"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMemberListPage;
