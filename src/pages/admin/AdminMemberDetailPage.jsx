import { useContext, useId, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import {
  getAdminMemberBlacklistHistory,
  getAdminMemberCurrentBlacklistStatus,
  getAdminMemberDetail,
  registerAdminMemberBlacklist,
  releaseAdminMemberBlacklist,
  updateAdminMember,
  updateAdminMemberStatus,
} from "../../api/memberApi";
import { isMockMode } from "../../api/client";
import { getAdminMemberRentalHistory, getMemberRentalCount, rentalKeys } from "../../api/rentalApi";

import MemberInfoCard from "../../components/card/MemberInfoCard";
import MemberEditModal from "../../components/modal/MemberEditModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import BlacklistActionModal from "../../components/modal/BlacklistActionModal";
import IconButton from "../../components/common/IconButton";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";
import { MEMBER_STATUS, RENTAL_STATUS } from "../../constants/status";
import { useUser } from "../../context/UserContext";
import { SemesterContext } from "../../context/SemesterContext";

import styles from "./AdminMemberDetailPage.module.css";

const BLACKLIST_PAGE_SIZE = 5;
const RENTAL_PAGE_SIZE = 10;

const MEMBER_BADGE_STATUS = {
  active: MEMBER_STATUS.active,
  suspended: MEMBER_STATUS.suspended,
};

const MEMBER_STATUS_LABEL = {
  withdrawn: "탈퇴회원",
  unknown: "상태 미확인",
};

const RENTAL_BADGE_STATUS = {
  approvalPending: RENTAL_STATUS.pendingApproval,
  pickupPending: RENTAL_STATUS.readyForPickup,
  renting: RENTAL_STATUS.renting,
  rented: RENTAL_STATUS.renting,
  overdue: RENTAL_STATUS.overdue,
  returned: RENTAL_STATUS.returned,
  rejected: RENTAL_STATUS.rejected,
  canceled: RENTAL_STATUS.canceled,
  noShow: RENTAL_STATUS.noShow,
};

function TextValue({ value, className = "" }) {
  return (
    <span
      className={className || styles.primaryText}
      title={value || undefined}
    >
      {value || "-"}
    </span>
  );
}

function DateValue({ value, label }) {
  if (!value) {
    return (
      <span>
        <span aria-hidden="true">-</span>
        <span className={styles.visuallyHidden}>{label} 없음</span>
      </span>
    );
  }

  const dateTime = value.includes(".") ? value.replaceAll(".", "-") : undefined;

  return (
    <time dateTime={dateTime} aria-label={`${label} ${value}`}>
      {value}
    </time>
  );
}

function EquipmentCell({ rental }) {
  return (
    <div className={styles.equipmentCell}>
      <span className={styles.equipmentImage} aria-hidden="true">
        {rental.imageSrc ? (
          <img
            className={styles.equipmentPhoto}
            src={rental.imageSrc}
            alt=""
            width={52}
            height={52}
          />
        ) : (
          <span className={styles.photoIcon} />
        )}
      </span>

      <span className={styles.cellStack}>
        <strong className={styles.equipmentName} title={rental.equipmentName}>
          {rental.equipmentName}
        </strong>
      </span>
    </div>
  );
}

function CategoryCell({ rental }) {
  return (
    <span className={styles.cellStack}>
      <span className={styles.primaryText} title={rental.category}>
        {rental.category}
      </span>

      {rental.os ? (
        <span className={styles.secondaryText} title={rental.os}>
          {rental.os}
        </span>
      ) : null}
    </span>
  );
}

function RequestDatesCell({ rental }) {
  return (
    <span className={styles.dateGroup}>
      <span className={styles.dateText}>
        <DateValue value={rental.requestedDate} label="신청일" />
        <span aria-hidden="true"> /</span>
      </span>

      <span className={styles.dateText}>
        <DateValue value={rental.pickupDate} label="수령일" />
      </span>
    </span>
  );
}

function RentalStatusCell({ rental }) {
  const badgeStatus = RENTAL_BADGE_STATUS[rental.status];

  if (!badgeStatus) {
    return <span className={styles.primaryText}>-</span>;
  }

  return (
    <div className={styles.statusCell}>
      <StatusBadge text={badgeStatus.label} color={badgeStatus.color} size="md" />
    </div>
  );
}

const BLACKLIST_NUMBER_COLUMN = {
  key: "number",
  header: "번호",
  width: 80,
  render: (record) => <TextValue value={String(record.number)} />,
};

const BLACKLIST_EDIT_COLUMN = {
  key: "edit",
  header: "수정",
  width: 48,
  render: (record) => (
    <IconButton
      icon="edit"
      size={24}
      disabled
      ariaLabel={`${record.number}번 블랙리스트 기록 수정 기능 미연결`}
      title="실제 수정 기능 미연결"
    />
  ),
};

const BLACKLIST_COLUMNS = [
  BLACKLIST_NUMBER_COLUMN,
  {
    key: "startDate",
    header: "시작날짜",
    width: 120,
    render: (record) => (
      <span className={styles.dateText}>
        <DateValue value={record.startDate} label="시작날짜" />
      </span>
    ),
  },
  {
    key: "endDate",
    header: "종료(예정)날짜",
    width: 140,
    render: (record) => (
      <span className={styles.dateText}>
        <DateValue value={record.endDate} label="종료 예정 날짜" />
      </span>
    ),
  },
  {
    key: "reason",
    header: "블랙리스트 사유",
    width: 732,
    render: (record) => <TextValue value={record.reason} />,
  },
  BLACKLIST_EDIT_COLUMN,
];

const API_BLACKLIST_COLUMNS = [
  BLACKLIST_NUMBER_COLUMN,
  {
    key: "semesterName",
    header: "적용 학기",
    width: 130,
    render: (record) => <TextValue value={record.semesterName} />,
  },
  {
    key: "createdAt",
    header: "등록일",
    width: 120,
    render: (record) => <DateValue value={record.createdAt} label="등록일" />,
  },
  {
    key: "releasedAt",
    header: "해제일",
    width: 130,
    render: (record) => record.active
      ? <TextValue value="미해제" />
      : <DateValue value={record.releasedAt} label="해제일" />,
  },
  {
    key: "reason",
    header: "블랙리스트 사유",
    width: 540,
    render: (record) => <TextValue value={record.reason} />,
  },
];

const RENTAL_COLUMNS = [
  {
    key: "equipment",
    header: "기자재 모델 정보",
    width: 300,
    render: (rental) => <EquipmentCell rental={rental} />,
  },
  {
    key: "category",
    header: "카테고리",
    width: 140,
    render: (rental) => <CategoryCell rental={rental} />,
  },
  {
    key: "assetNumber",
    header: "비품번호",
    width: 140,
    render: (rental) => <TextValue value={rental.assetNumber} />,
  },
  {
    key: "rentalType",
    header: "대여 유형",
    width: 100,
    render: (rental) => <TextValue value={rental.rentalType} />,
  },
  {
    key: "requestDates",
    header: "신청일 / 수령일",
    width: 160,
    render: (rental) => <RequestDatesCell rental={rental} />,
  },
  {
    key: "returnedDate",
    header: "반납일",
    width: 140,
    render: (rental) => (
      <span className={styles.dateText}>
        <DateValue value={rental.returnedDate} label="반납일" />
      </span>
    ),
  },
  {
    key: "status",
    header: "상태",
    width: 140,
    render: (rental) => <RentalStatusCell rental={rental} />,
  },
];

function AdminMemberDetailPage() {
  const { user } = useUser();
  const { schedule, isLoading: isSemesterLoading, error: semesterError } = useContext(SemesterContext);
  const canEditMember = isMockMode || user?.serverRole === "ASSISTANT";
  const canManageBlacklist = !isMockMode && user?.serverRole === "ASSISTANT";
  const currentSemester = schedule?.current;
  const hasCurrentSemester = Number.isSafeInteger(currentSemester?.semesterId) && currentSemester.semesterId > 0;
  const panelId = useId();
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const statusRequestRef = useRef(false);

  const [selectedTab, setSelectedTab] = useState("info");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nextMemberStatus, setNextMemberStatus] = useState(null);
  const [blacklistAction, setBlacklistAction] = useState(null);
  const [blacklistPage, setBlacklistPage] = useState(1);
  const [rentalKeyword, setRentalKeyword] = useState("");
  const [rentalPage, setRentalPage] = useState(1);

  const memberQuery = useQuery({
    queryKey: ["admin", "members", "detail", userId],
    queryFn: ({ signal }) => getAdminMemberDetail(userId, { signal }),
    enabled: Boolean(userId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const updateMemberMutation = useMutation({
    mutationFn: (fields) => {
      if (!canEditMember) throw new Error("회원 수정 권한이 없습니다.");
      return updateAdminMember(userId, fields);
    },
    onSuccess: (updatedMember) => {
      queryClient.setQueryData(
        ["admin", "members", "detail", userId],
        updatedMember,
      );
      queryClient.invalidateQueries({
        queryKey: ["admin", "members", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "members", "counts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "members", "detail", userId],
      });
      setIsEditModalOpen(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status) => {
      if (!canEditMember) throw new Error("회원 상태 변경 권한이 없습니다.");
      return updateAdminMemberStatus(userId, status);
    },
    onSuccess: (updatedMember) => {
      queryClient.setQueryData(
        ["admin", "members", "detail", userId],
        updatedMember,
      );
      queryClient.invalidateQueries({
        queryKey: ["admin", "members", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "members", "counts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "members", "detail", userId],
      });
      setNextMemberStatus(null);
    },
  });

  const blacklistMutation = useMutation({
    mutationFn: ({ action, semesterId, reason }) => {
      if (!canManageBlacklist) throw new Error("블랙리스트 관리 권한이 없습니다.");
      return action.type === "register"
        ? registerAdminMemberBlacklist({ memberId: userId, semesterId, reasonDetail: reason })
        : releaseAdminMemberBlacklist({ blacklistId: action.record.id, releaseReason: reason });
    },
    onSuccess: (_result, { action }) => {
      if (action.type === "register") setBlacklistPage(1);
      queryClient.invalidateQueries({ queryKey: ["admin", "members", userId, "blacklist-history"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "members", userId, "blacklist-status"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "members", "detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "members", "list"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "members", "counts"] });
      queryClient.invalidateQueries({ queryKey: rentalKeys.all });
      setBlacklistAction(null);
    },
  });

  const blacklistQuery = useQuery({
    queryKey: [
      "admin",
      "members",
      userId,
      "blacklist-history",
      {
        page: blacklistPage - 1,
        size: BLACKLIST_PAGE_SIZE,
      },
    ],
    queryFn: ({ signal }) =>
      getAdminMemberBlacklistHistory({
        memberId: userId,
        page: blacklistPage - 1,
        size: BLACKLIST_PAGE_SIZE,
        signal,
      }),
    enabled:
      Boolean(userId) && Boolean(memberQuery.data) && selectedTab === "info",
    retry: false,
    refetchOnWindowFocus: false,
  });

  const blacklistStatusQuery = useQuery({
    queryKey: ["admin", "members", userId, "blacklist-status", currentSemester?.semesterId],
    queryFn: ({ signal }) => getAdminMemberCurrentBlacklistStatus({
      memberId: userId,
      semesterId: currentSemester.semesterId,
      signal,
    }),
    enabled: !isMockMode && Boolean(userId) && hasCurrentSemester,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const rentalQuery = useQuery({
    queryKey: rentalKeys.memberHistory(userId, {
      page: rentalPage - 1,
      size: RENTAL_PAGE_SIZE,
      keyword: rentalKeyword,
    }),
    queryFn: ({ signal }) =>
      getAdminMemberRentalHistory(userId, {
        page: rentalPage - 1,
        size: RENTAL_PAGE_SIZE,
        keyword: rentalKeyword,
        signal,
      }),
    enabled:
      Boolean(userId) &&
      Boolean(memberQuery.data) &&
      selectedTab === "rentals",
    retry: false,
    refetchOnWindowFocus: false,
  });

  const rentalCountQuery = useQuery({
    queryKey: rentalKeys.memberCount(userId),
    queryFn: ({ signal }) => getMemberRentalCount(userId, { signal }),
    enabled: Boolean(userId) && Boolean(memberQuery.data),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (!userId) {
    return (
      <div className={styles.page}>
        <PageHeader />
        <p className={`${styles.state} ${styles.stateError}`} role="alert">
          회원 식별자를 확인할 수 없습니다.
        </p>
      </div>
    );
  }

  if (memberQuery.isPending) {
    return (
      <div className={styles.page}>
        <PageHeader />
        <p className={styles.state} aria-live="polite">
          회원 정보를 불러오는 중입니다.
        </p>
      </div>
    );
  }

  if (memberQuery.isError || !memberQuery.data) {
    return (
      <div className={styles.page}>
        <PageHeader />
        <p className={`${styles.state} ${styles.stateError}`} role="alert">
          회원 정보를 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  const member = memberQuery.data;
  const membershipStatus = isMockMode || member.membershipStatus === "withdrawn"
    ? member.membershipStatus
    : blacklistStatusQuery.data === true
      ? "suspended"
      : blacklistStatusQuery.data === false ? "active" : "unknown";

  const tabItems = [
    {
      value: "info",
      label: "학생 정보",
      controlsId: panelId,
    },
    {
      value: "rentals",
      label: "대여 내역",
      count: rentalCountQuery.data ?? "-",
      controlsId: panelId,
    },
  ];

  const blacklistRows = blacklistQuery.data?.content ?? [];
  const blacklistTotalPages = Math.max(1, blacklistQuery.data?.totalPages ?? 0);
  const resolvedBlacklistPage = blacklistQuery.data
    ? blacklistQuery.data.page + 1
    : 1;

  const rentalRows = rentalQuery.data?.content ?? [];
  const rentalTotalPages = Math.max(1, rentalQuery.data?.totalPages ?? 0);
  const resolvedRentalPage = rentalQuery.data ? rentalQuery.data.page + 1 : 1;

  const handleRentalSearchChange = (event) => {
    setRentalKeyword(event.target.value);
    setRentalPage(1);
  };

  const handleRentalSearchSubmit = (inputText) => {
    setRentalKeyword(inputText);
    setRentalPage(1);
  };

  const handleOpenEditModal = () => {
    if (!canEditMember) return;
    updateMemberMutation.reset();
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (!updateMemberMutation.isPending) {
      setIsEditModalOpen(false);
    }
  };

  const handleOpenStatusModal = () => {
    if (!canEditMember) return;
    updateStatusMutation.reset();

    if (member.membershipStatus === "active") {
      setNextMemberStatus("SUSPENDED");
    } else if (member.membershipStatus === "suspended") {
      setNextMemberStatus("ACTIVE");
    }
  };

  const handleCloseStatusModal = () => {
    if (!updateStatusMutation.isPending && !statusRequestRef.current) {
      setNextMemberStatus(null);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (
      !canEditMember ||
      !nextMemberStatus ||
      updateStatusMutation.isPending ||
      statusRequestRef.current
    ) {
      return;
    }

    statusRequestRef.current = true;

    try {
      await updateStatusMutation.mutateAsync(nextMemberStatus);
    } catch {
      // 오류는 확인창에 표시하고 기존 회원 상태를 유지함.
    } finally {
      statusRequestRef.current = false;
    }
  };

  const statusActionLabel =
    member.membershipStatus === "active"
      ? "블랙리스트 등록"
      : member.membershipStatus === "suspended"
        ? "블랙리스트 해제"
        : null;

  const apiBlacklistColumns = [
    ...API_BLACKLIST_COLUMNS,
    {
      key: "release",
      header: "해제",
      width: 120,
      align: "center",
      render: (record) => record.active ? (
        <button
          type="button"
          className={styles.releaseButton}
          disabled={!canManageBlacklist || blacklistMutation.isPending}
          title={!canManageBlacklist ? "조교만 해제할 수 있습니다." : undefined}
          onClick={() => { blacklistMutation.reset(); setBlacklistAction({ type: "release", record }); }}
        >해제</button>
      ) : "-",
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader customTitle={member.name} />

      <div
        className={styles.contentViewport}
        role="region"
        aria-label={`${member.name} 회원 상세 영역`}
      >
        <div className={styles.content}>
          <div className={styles.tabToolbar}>
            <Tabs
              className={styles.detailTabs}
              items={tabItems}
              value={selectedTab}
              onChange={setSelectedTab}
              ariaLabel="회원 상세 정보"
            />

            {selectedTab === "rentals" ? (
              <SearchBar
                className={styles.search}
                name="memberRentalSearch"
                width={360}
                value={rentalKeyword}
                onChange={handleRentalSearchChange}
                onSubmit={handleRentalSearchSubmit}
                ariaLabel="회원 대여 기기 검색"
                placeholder="모델명·비품번호 검색"
              />
            ) : null}
          </div>

          {selectedTab === "info" ? (
            <div
              id={panelId}
              className={styles.panel}
              role="tabpanel"
              aria-label="학생 정보"
              aria-busy={blacklistQuery.isFetching}
            >
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>기본 정보</h3>

                <MemberInfoCard
                  member={member}
                  badgeStatus={MEMBER_BADGE_STATUS[membershipStatus]}
                  statusLabel={
                    MEMBER_STATUS_LABEL[membershipStatus] ??
                    (membershipStatus === "active"
                      ? null
                      : "상태 미확인")
                  }
                  onEditMember={canEditMember ? handleOpenEditModal : undefined}
                  onEditPhone={canEditMember ? handleOpenEditModal : undefined}
                  onEditEmail={canEditMember ? handleOpenEditModal : undefined}
                  editDisabledReason={!canEditMember ? "조교만 수정할 수 있습니다." : undefined}
                  statusActionLabel={isMockMode ? statusActionLabel
                    : membershipStatus === "suspended" ? null : "블랙리스트 등록"}
                  statusActionPending={isMockMode ? updateStatusMutation.isPending : blacklistMutation.isPending}
                  onStatusAction={isMockMode
                    ? statusActionLabel ? handleOpenStatusModal : undefined
                    : canManageBlacklist && hasCurrentSemester && blacklistStatusQuery.data === false
                      ? () => { blacklistMutation.reset(); setBlacklistAction({ type: "register" }); }
                      : undefined}
                  statusActionDisabledReason={isMockMode ? undefined
                    : !canManageBlacklist ? "조교만 등록할 수 있습니다."
                      : isSemesterLoading ? "학기 정보를 불러오는 중입니다."
                        : semesterError ? "학기 정보를 불러오지 못했습니다."
                          : !hasCurrentSemester ? "등록할 학기 정보가 없습니다."
                            : blacklistStatusQuery.isPending ? "블랙리스트 상태를 확인하는 중입니다."
                              : blacklistStatusQuery.error?.message ?? "블랙리스트 상태를 확인할 수 없습니다."}
                />
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>블랙리스트 기록</h3>

                {blacklistQuery.isPending ? (
                  <p className={styles.state} aria-live="polite">
                    블랙리스트 기록을 불러오는 중입니다.
                  </p>
                ) : blacklistQuery.isError && !blacklistQuery.data ? (
                  <p
                    className={`${styles.state} ${styles.stateError}`}
                    role="alert"
                  >
                    {blacklistQuery.error?.message ||
                      "블랙리스트 기록을 불러오지 못했습니다."}
                  </p>
                ) : (
                  <>
                    {blacklistQuery.isError && blacklistQuery.data ? (
                      <p role="alert">
                        기록을 새로 불러오지 못했습니다. 이전 결과를 표시합니다.
                      </p>
                    ) : null}

                    <DataTable
                      className={styles.table}
                      ariaLabel={`${member.name} 블랙리스트 기록`}
                      columns={isMockMode ? BLACKLIST_COLUMNS : apiBlacklistColumns}
                      rows={blacklistRows}
                      getRowId={(record) => record.id}
                      minWidth={1120}
                      emptyMessage="블랙리스트 기록이 없습니다."
                    />

                    <div className={styles.footer}>
                      <Pagination
                        page={resolvedBlacklistPage}
                        totalPages={blacklistTotalPages}
                        onChange={setBlacklistPage}
                        ariaLabel="블랙리스트 기록 페이지 이동"
                      />
                    </div>
                  </>
                )}
              </section>
            </div>
          ) : (
            <div
              id={panelId}
              className={styles.panel}
              role="tabpanel"
              aria-label="대여 내역"
              aria-busy={rentalQuery.isFetching}
            >
              {rentalQuery.isPending ? (
                <p className={styles.state} aria-live="polite">
                  대여 내역을 불러오는 중입니다.
                </p>
              ) : rentalQuery.isError && !rentalQuery.data ? (
                <p
                  className={`${styles.state} ${styles.stateError}`}
                  role="alert"
                >
                  대여 내역을 불러오지 못했습니다.
                </p>
              ) : (
                <>
                  {rentalQuery.isError && rentalQuery.data ? (
                    <p role="alert">
                      대여 내역을 새로 불러오지 못했습니다. 이전 결과를
                      표시합니다.
                    </p>
                  ) : null}

                  <DataTable
                    className={styles.table}
                    ariaLabel={`${member.name} 대여 내역`}
                    columns={RENTAL_COLUMNS}
                    rows={rentalRows}
                    getRowId={(rental) => rental.rentalId}
                    minWidth={1120}
                    emptyMessage={
                      rentalKeyword.trim()
                        ? "검색 조건에 해당하는 대여 내역이 없습니다."
                        : "대여 내역이 없습니다."
                    }
                  />

                  <div className={styles.footer}>
                    <Pagination
                      page={resolvedRentalPage}
                      totalPages={rentalTotalPages}
                      onChange={setRentalPage}
                      ariaLabel="회원 대여 내역 페이지 이동"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {canEditMember && isEditModalOpen ? (
        <MemberEditModal
          key={member.userId}
          isOpen
          member={member}
          isPending={updateMemberMutation.isPending}
          error={updateMemberMutation.error}
          onClose={handleCloseEditModal}
          onSubmit={(fields) => {
            if (canEditMember) updateMemberMutation.mutate(fields);
          }}
        />
      ) : null}

      {canManageBlacklist && blacklistAction ? (
        <BlacklistActionModal
          key={`${blacklistAction.type}-${blacklistAction.record?.id ?? "new"}`}
          action={blacklistAction}
          memberName={member.name}
          semester={currentSemester}
          isPending={blacklistMutation.isPending}
          error={blacklistMutation.error}
          onClose={() => { if (!blacklistMutation.isPending) setBlacklistAction(null); }}
          onSubmit={({ semesterId, reason }) =>
            blacklistMutation.mutateAsync({ action: blacklistAction, semesterId, reason })}
        />
      ) : null}

      <ConfirmModal
        isOpen={canEditMember && Boolean(nextMemberStatus)}
        title={
          nextMemberStatus === "SUSPENDED"
            ? "블랙리스트로 등록할까요?"
            : "블랙리스트를 해제할까요?"
        }
        description={
          nextMemberStatus === "SUSPENDED"
            ? `${member.name} 회원을 블랙리스트로 등록합니다.`
            : `${member.name} 회원을 일반회원으로 전환합니다.`
        }
        secondaryDescription={updateStatusMutation.error?.message}
        confirmText={
          updateStatusMutation.isPending
            ? "처리 중..."
            : (statusActionLabel ?? "확인")
        }
        confirmColor="Danger"
        actionsDisabled={updateStatusMutation.isPending}
        closeOnEscape={!updateStatusMutation.isPending}
        closeOnOverlay={!updateStatusMutation.isPending}
        onClose={handleCloseStatusModal}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}

export default AdminMemberDetailPage;
