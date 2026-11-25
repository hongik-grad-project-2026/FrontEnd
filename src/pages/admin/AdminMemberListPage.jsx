import { useEffect, useId, useRef, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MEMBER_STATUS } from "../../constants/status";
import {
  getAdminMemberCapabilities,
  getAdminMembers,
} from "../../api/memberApi";

import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";
import Tabs from "../../components/common/Tabs";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import { useUser } from "../../context/UserContext";

import styles from "./AdminMemberListPage.module.css";

const PAGE_SIZE = 10;
const COUNT_QUERY_SIZE = 1;
const COUNT_STALE_TIME = 30 * 1000;

const MEMBER_TABS = [
  { value: "all", label: "전체" },
  { value: "active", label: "일반회원" },
  { value: "suspended", label: "블랙리스트" },
];

const AFFILIATION_OPTIONS = [
  { value: "all", label: "전체 소속" },
  { value: "own", label: "소속 학과" },
  { value: "other", label: "타과생" },
];

function MemberNameCell({ member }) {
  return (
    <span className={styles.memberCell}>
      <MemberAvatar key={member.profileImageSrc ?? "no-image"} member={member} />

      <span className={styles.memberName} title={member.name}>
        {member.name}
      </span>
    </span>
  );
}

function MemberAvatar({ member }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span className={styles.avatar} aria-hidden="true">
      {member.profileImageSrc && !imageFailed ? (
        <img
          className={styles.avatarImage}
          src={member.profileImageSrc}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={styles.userIcon} />
      )}
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

function DepartmentFilterHeader({
  value,
  canFilterOtherDepartment,
  onChange,
}) {
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel =
    value === "own" ? "소속" : value === "other" ? "타과생" : "";

  const options = AFFILIATION_OPTIONS.map((option) => ({
    ...option,
    disabled:
      option.value === "other" && !canFilterOtherDepartment,
  }));

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutsidePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    if (option.disabled) {
      return;
    }

    onChange(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={styles.departmentFilter}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.departmentFilterTrigger}
        data-active={value !== "all"}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span>학과{selectedLabel ? ` · ${selectedLabel}` : ""}</span>
        <span className={styles.departmentFilterIcon} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className={styles.departmentFilterMenu} role="menu">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={styles.departmentFilterOption}
                role="menuitemradio"
                aria-checked={isSelected}
                disabled={option.disabled}
                data-selected={isSelected}
                onClick={() => handleSelect(option)}
              >
                <span className={styles.departmentFilterCheck} aria-hidden="true">
                  {isSelected ? "✓" : ""}
                </span>
                <span>{option.label}</span>
                {option.disabled ? (
                  <span className={styles.unsupportedLabel}>API 미지원</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
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
    render: (member) => {
      const badgeStatus = MEMBER_STATUS[member.membershipStatus];

      return badgeStatus ? (
        <StatusBadge text={badgeStatus.label} color={badgeStatus.color} />
      ) : (
        <TextCell
          text={MEMBER_STATUS[member.membershipStatus] ?? "상태 미확인"}
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
  const { user, refreshCurrentUser } = useUser();

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAffiliation, setSelectedAffiliation] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { canFilterOtherDepartment } = getAdminMemberCapabilities();

  const needsAffiliationInfo = selectedAffiliation !== "all";
  const hasUserAffiliation = Boolean(user?.department);
  const currentUserQuery = useQuery({
    queryKey: ["currentUser", user?.id],
    queryFn: ({ signal }) => refreshCurrentUser({ signal }),
    enabled: needsAffiliationInfo && !hasUserAffiliation,
    initialData: hasUserAffiliation ? user : undefined,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const affiliationUser = hasUserAffiliation ? user : currentUserQuery.data;
  const canLoadMembers =
    !needsAffiliationInfo || Boolean(affiliationUser?.department);

  // 화면 페이지 번호는 1부터 시작함.
  // 조회 함수에 전달할 때 0부터 시작하는 번호로 변환함.
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: memberPage,
    isPending: isMembersPending,
    isFetching: isMembersFetching,
    isError: isMembersError,
    error: membersError,
  } = useQuery({
    queryKey: [
      "admin",
      "members",
      "list",
      {
        keyword: searchTerm,
        status: selectedStatus === "all" ? "" : selectedStatus,
        affiliation: selectedAffiliation,
        currentCollege: affiliationUser?.college ?? "",
        currentDepartment: affiliationUser?.department ?? "",
        page: currentPage - 1,
        size: PAGE_SIZE,
      },
    ],
    queryFn: ({ signal }) =>
      getAdminMembers({
        keyword: searchTerm,
        status: selectedStatus === "all" ? "" : selectedStatus,
        affiliation: selectedAffiliation,
        currentCollege: affiliationUser?.college ?? "",
        currentDepartment: affiliationUser?.department ?? "",
        page: currentPage - 1,
        size: PAGE_SIZE,
        signal,
      }),
    enabled: canLoadMembers,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const memberCountQueries = useQueries({
    queries: MEMBER_TABS.map((tab) => {
      const status = tab.value === "all" ? "" : tab.value;

      return {
        queryKey: [
          "admin",
          "members",
          "counts",
          {
            keyword: searchTerm,
            status,
            affiliation: selectedAffiliation,
            currentCollege: affiliationUser?.college ?? "",
            currentDepartment: affiliationUser?.department ?? "",
            size: COUNT_QUERY_SIZE,
          },
        ],
        queryFn: ({ signal }) =>
          getAdminMembers({
            keyword: searchTerm,
            status,
            affiliation: selectedAffiliation,
            currentCollege: affiliationUser?.college ?? "",
            currentDepartment: affiliationUser?.department ?? "",
            page: 0,
            size: COUNT_QUERY_SIZE,
            signal,
          }),
        enabled:
          canLoadMembers &&
          (selectedAffiliation !== "other" || canFilterOtherDepartment),
        staleTime: COUNT_STALE_TIME,
        retry: false,
        refetchOnWindowFocus: false,
      };
    }),
  });

  const tabItems = MEMBER_TABS.map((tab, index) => ({
    ...tab,
    count: memberCountQueries[index].data?.totalElements ?? "-",
    controlsId: panelId,
  }));

  const selectedTab = tabItems.find((tab) => tab.value === selectedStatus);

  // 검색·필터·페이지 분할이 완료된 현재 페이지 데이터임.
  const visibleMembers = memberPage?.content ?? [];

  // 조회 결과가 없어도 화면에는 1페이지를 표시함.
  const totalPages = Math.max(1, memberPage?.totalPages ?? 0);

  const resolvedCurrentPage = memberPage ? memberPage.page + 1 : 1;

  let emptyMessage = searchTerm.trim()
    ? "검색 조건에 해당하는 회원이 없습니다."
    : "표시할 회원이 없습니다.";

  if (needsAffiliationInfo && currentUserQuery.isPending) {
    emptyMessage = "관리자 소속 정보를 불러오는 중입니다.";
  } else if (needsAffiliationInfo && currentUserQuery.isError) {
    emptyMessage =
      currentUserQuery.error?.message ||
      "관리자 소속 정보를 불러오지 못했습니다.";
  } else if (isMembersPending) {
    emptyMessage = "회원 목록을 불러오는 중입니다.";
  } else if (isMembersError) {
    emptyMessage =
      membersError?.message || "회원 목록을 불러오지 못했습니다.";
  }

  const handleStatusChange = (nextStatus) => {
    setSelectedStatus(nextStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleAffiliationChange = (nextAffiliation) => {
    setSelectedAffiliation(nextAffiliation);
    setCurrentPage(1);
  };

  // 기존 입력 즉시 검색 동작을 유지함.
  // Enter와 검색 버튼에 동일한 검색어를 적용함.
  // SearchBar의 기본 alert 실행을 방지함.
  const handleSearchSubmit = (inputText) => {
    setSearchTerm(inputText);
    setCurrentPage(1);
  };

  const handleOpenMemberDetail = (member) => {
    navigate(`/admin/members/${encodeURIComponent(member.id)}`);
  };

  const memberColumns = MEMBER_COLUMNS.map((column) =>
    column.key === "department"
      ? {
        ...column,
        header: (
          <DepartmentFilterHeader
            value={selectedAffiliation}
            canFilterOtherDepartment={canFilterOtherDepartment}
            onChange={handleAffiliationChange}
          />
        ),
      }
      : column,
  );

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
              allowHeaderOverflow
              ariaLabel="회원 관리 목록"
              columns={memberColumns}
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
