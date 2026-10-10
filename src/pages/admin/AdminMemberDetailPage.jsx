import { useId, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import {
  getAdminMemberBlacklistHistory,
  getAdminMemberDetail,
  getAdminMemberRentalHistory,
  updateAdminMember,
  updateAdminMemberStatus,
} from "../../api/memberApi";

import MemberInfoCard from "../../components/card/MemberInfoCard";
import MemberEditModal from "../../components/modal/MemberEditModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import IconButton from "../../components/common/IconButton";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";

import styles from "./AdminMemberDetailPage.module.css";

const BLACKLIST_PAGE_SIZE = 5;
const RENTAL_PAGE_SIZE = 10;

const MEMBER_BADGE_STATUS = {
  active: "회원-일반",
  suspended: "회원-블랙",
};

const MEMBER_STATUS_LABEL = {
  withdrawn: "탈퇴회원",
  unknown: "상태 미확인",
};

const RENTAL_BADGE_STATUS = {
  approvalPending: "대여-승인대기",
  pickupPending: "대여-수령대기",
  rented: "대여-대여중",
  overdue: "대여-연체",
  returned: "대여-반납완료",
  canceled: "대여-신청취소",
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

        {rental.modelName ? (
          <span className={styles.secondaryText} title={rental.modelName}>
            {rental.modelName}
          </span>
        ) : null}
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
      <StatusBadge status={badgeStatus} size="md" />
    </div>
  );
}

const BLACKLIST_COLUMNS = [
  {
    key: "number",
    header: "번호",
    width: 80,
    render: (record) => <TextValue value={String(record.number)} />,
  },
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
  {
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
  },
];

const RENTAL_COLUMNS = [
  {
    key: "equipment",
    header: "기자재 정보",
    width: 300,
    render: (rental) => <EquipmentCell rental={rental} />,
  },
  {
    key: "category",
    header: "카테고리 / OS",
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
  const panelId = useId();
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const statusRequestRef = useRef(false);

  const [selectedTab, setSelectedTab] = useState("info");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nextMemberStatus, setNextMemberStatus] = useState(null);
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
    mutationFn: (fields) => updateAdminMember(userId, fields),
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
    mutationFn: (status) => updateAdminMemberStatus(userId, status),
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
    queryFn: () =>
      getAdminMemberBlacklistHistory({
        memberId: userId,
        page: blacklistPage - 1,
        size: BLACKLIST_PAGE_SIZE,
      }),
    enabled:
      Boolean(userId) && Boolean(memberQuery.data) && selectedTab === "info",
    retry: false,
    refetchOnWindowFocus: false,
  });

  const rentalQuery = useQuery({
    queryKey: [
      "admin",
      "members",
      userId,
      "rental-history",
      {
        page: rentalPage - 1,
        size: RENTAL_PAGE_SIZE,
        keyword: rentalKeyword,
      },
    ],
    queryFn: () =>
      getAdminMemberRentalHistory({
        memberId: userId,
        page: rentalPage - 1,
        size: RENTAL_PAGE_SIZE,
        keyword: rentalKeyword,
      }),
    enabled:
      Boolean(userId) &&
      Boolean(memberQuery.data) &&
      selectedTab === "rentals",
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

  const tabItems = [
    {
      value: "info",
      label: "학생 정보",
      controlsId: panelId,
    },
    {
      value: "rentals",
      label: "대여 내역",
      count: member.rentalCount,
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
    updateMemberMutation.reset();
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (!updateMemberMutation.isPending) {
      setIsEditModalOpen(false);
    }
  };

  const handleOpenStatusModal = () => {
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
      // 오류는 확인창에 보여주고 기존 회원 상태를 유지해.
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
                ariaLabel="회원 대여 기자재 검색"
                placeholder="기자재명·모델명·비품번호 검색"
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
                  badgeStatus={MEMBER_BADGE_STATUS[member.membershipStatus]}
                  statusLabel={
                    MEMBER_STATUS_LABEL[member.membershipStatus] ??
                    (member.membershipStatus === "active"
                      ? null
                      : "상태 미확인")
                  }
                  onEditMember={handleOpenEditModal}
                  onEditPhone={handleOpenEditModal}
                  onEditEmail={handleOpenEditModal}
                  statusActionLabel={statusActionLabel}
                  statusActionPending={updateStatusMutation.isPending}
                  onStatusAction={
                    statusActionLabel ? handleOpenStatusModal : undefined
                  }
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
                    {blacklistQuery.error?.code === "API_NOT_SUPPORTED"
                      ? "블랙리스트 기록 API가 아직 제공되지 않았습니다."
                      : "블랙리스트 기록을 불러오지 못했습니다."}
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
                      columns={BLACKLIST_COLUMNS}
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
                  {rentalQuery.error?.code === "API_NOT_SUPPORTED"
                    ? "회원별 대여 기록 API가 아직 제공되지 않았습니다."
                    : "대여 내역을 불러오지 못했습니다."}
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
                    getRowId={(rental) => rental.id}
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

      {isEditModalOpen ? (
        <MemberEditModal
          key={member.userId}
          isOpen
          member={member}
          isPending={updateMemberMutation.isPending}
          error={updateMemberMutation.error}
          onClose={handleCloseEditModal}
          onSubmit={(fields) => updateMemberMutation.mutate(fields)}
        />
      ) : null}

      <ConfirmModal
        isOpen={Boolean(nextMemberStatus)}
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
