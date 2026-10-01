import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getAdminMembers } from "../../api/memberApi";

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
  { value: "ACTIVE", label: "활성" },
  { value: "SUSPENDED", label: "정지" },
  { value: "WITHDRAWN", label: "탈퇴" },
];

const MEMBER_BADGE_STATUS = {
  active: "회원-일반",
};

const MEMBER_STATUS_LABEL = {
  suspended: "정지회원",
  withdrawn: "탈퇴회원",
  unknown: "상태 미확인",
};

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
    header: "상태",
    width: 116,
    render: (member) => {
      const badgeStatus = MEMBER_BADGE_STATUS[member.membershipStatus];

      return badgeStatus ? (
        <StatusBadge status={badgeStatus} size="md" />
      ) : (
        <TextCell
          text={MEMBER_STATUS_LABEL[member.membershipStatus] ?? "상태 미확인"}
        />
      );
    },
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
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const college = "";
  const department = "";

  // 화면 페이지 번호: 1부터 시작
  // 조회 함수 전달 시 0부터 시작하는 번호로 변환
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: memberPage,
    isPending: isMembersPending,
    isFetching: isMembersFetching,
    isError: isMembersError,
  } = useQuery({
    queryKey: [
      "admin",
      "members",
      "list",
      {
        keyword: searchTerm,
        status: selectedStatus === "all" ? "" : selectedStatus,
        college,
        department,
        page: currentPage - 1,
        size: PAGE_SIZE,
      },
    ],
    queryFn: ({ signal }) =>
      getAdminMembers({
        keyword: searchTerm,
        status: selectedStatus === "all" ? "" : selectedStatus,
        college,
        department,
        page: currentPage - 1,
        size: PAGE_SIZE,
        signal,
      }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const tabItems = MEMBER_TABS.map((tab) => ({
    ...tab,
    count:
      tab.value === selectedStatus ? memberPage?.totalElements : undefined,
    controlsId: panelId,
  }));

  const selectedTab = tabItems.find((tab) => tab.value === selectedStatus);

  // 검색·필터·페이지 분할이 완료된 현재 페이지 데이터
  const visibleMembers = memberPage?.content ?? [];

  // 조회 결과가 없어도 화면에는 1페이지 표시
  const totalPages = Math.max(1, memberPage?.totalPages ?? 0);

  const resolvedCurrentPage = memberPage ? memberPage.page + 1 : 1;

  let emptyMessage = searchTerm.trim()
    ? "검색 조건에 해당하는 회원이 없습니다."
    : "표시할 회원이 없습니다.";

  if (isMembersPending) {
    emptyMessage = "회원 목록을 불러오는 중입니다.";
  } else if (isMembersError) {
    emptyMessage = "회원 목록을 불러오지 못했습니다.";
  }

  const handleStatusChange = (nextStatus) => {
    setSelectedStatus(nextStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  // 기존 입력 즉시 검색 동작 유지
  // Enter·검색 버튼에 동일한 검색어 적용
  // SearchBar 기본 alert 실행 방지
  const handleSearchSubmit = (inputText) => {
    setSearchTerm(inputText);
    setCurrentPage(1);
  };

  const handleOpenMemberDetail = (member) => {
    navigate(`/admin/members/${encodeURIComponent(member.id)}`);
  };

  return (
    <div className={styles.page}>
      <PageHeader />

      <div
        className={styles.contentViewport}
        role="region"
        aria-label="회원 목록 영역"
      >
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <Tabs
              className={styles.memberTabs}
              items={tabItems}
              value={selectedStatus}
              onChange={handleStatusChange}
              ariaLabel="회원 상태"
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
            aria-busy={isMembersFetching}
          >
            {isMembersError && memberPage && (
              <p role="alert">
                회원 목록을 새로 불러오지 못했습니다. 이전 조회 결과를
                표시합니다.
              </p>
            )}

            <DataTable
              className={styles.dataTable}
              ariaLabel="회원 관리 목록"
              columns={MEMBER_COLUMNS}
              rows={visibleMembers}
              getRowId={(member) => member.id}
              getRowLabel={(member) => `${member.name} 회원`}
              onRowClick={handleOpenMemberDetail}
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
