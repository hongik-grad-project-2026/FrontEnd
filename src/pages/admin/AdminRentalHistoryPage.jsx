import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isMockMode } from "../../api/client";
import {
  getAdminRentalHistory,
  getAdminRentalHistoryCounts,
  rentalKeys,
} from "../../api/rentalApi";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";
import styles from "./AdminRentalHistoryPage.module.css";

const ROWS_PER_PAGE = 10;
const STATUS_BADGES = { canceled: "대여-신청취소", returned: "대여-반납완료" };

function EquipmentCell({ record }) {
  return (
    <div className={styles.equipmentCell}>
      {/* 기자재명과 중복되는 이미지 영역은 장식 요소임. */}
      <span className={styles.equipmentImage} aria-hidden="true">
        {record.imageSrc ? (
          <img
            className={styles.equipmentPhoto}
            src={record.imageSrc}
            alt=""
            width={52}
            height={52}
          />
        ) : (
          <span className={styles.photoIcon} />
        )}
      </span>

      <span className={styles.cellStack}>
        <strong className={styles.equipmentName} title={record.equipmentName}>
          {record.equipmentName}
        </strong>

        {record.modelName ? (
          <span className={styles.secondaryText} title={record.modelName}>
            {record.modelName}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function CategoryCell({ record }) {
  return (
    <span className={styles.cellStack}>
      <span className={styles.primaryText} title={record.category}>
        {record.category}
      </span>

      {record.os ? (
        <span className={styles.secondaryText} title={record.os}>
          {record.os}
        </span>
      ) : null}
    </span>
  );
}

function ApplicantCell({ record }) {
  return (
    <div className={styles.applicantCell}>
      <span className={styles.userAvatar} aria-hidden="true">
        <span className={styles.userIcon} />
      </span>

      <span className={styles.cellStack}>
        <strong className={styles.applicantName} title={record.studentName}>
          {record.studentName}
        </strong>

        <span className={styles.secondaryText} title={record.studentId}>
          {record.studentId}
        </span>

        <span className={styles.departmentText} title={record.department}>
          {record.department}
        </span>
      </span>
    </div>
  );
}

// YYYY.MM.DD 문자열 또는 null만 지원함.
// 문자열 치환은 dateTime 표시용이며 범용 API 날짜 변환이 아니다.
function DateValue({ value, label }) {
  if (!value) {
    return (
      <span>
        <span aria-hidden="true">-</span>
        <span className={styles.visuallyHidden}>{label} 없음</span>
      </span>
    );
  }

  return (
    <time
      dateTime={value.replaceAll(".", "-")}
      aria-label={`${label} ${value}`}
    >
      {value}
    </time>
  );
}

function RequestDatesCell({ record }) {
  return (
    <span className={styles.cellStack}>
      <span className={styles.dateText}>
        <DateValue value={record.requestedDate} label="신청일" />
        <span aria-hidden="true">/</span>
      </span>

      <span className={styles.dateText}>
        <DateValue value={record.pickupDate} label="수령일" />
      </span>
    </span>
  );
}

function HistoryStatusCell({ record }) {
  const badgeStatus = STATUS_BADGES[record.status];

  if (!badgeStatus) {
    return <span className={styles.primaryText}>-</span>;
  }

  return (
    <div className={styles.statusCell}>
      <StatusBadge status={badgeStatus} size="md" />
    </div>
  );
}

const HISTORY_COLUMNS = [
  {
    key: "equipment",
    header: <span className={styles.firstColumnHeader}>기자재 정보</span>,
    width: 272,
    render: (record) => <EquipmentCell record={record} />,
  },
  {
    key: "category",
    header: "카테고리 / OS",
    width: 128,
    render: (record) => <CategoryCell record={record} />,
  },
  {
    key: "assetNumber",
    header: "비품번호",
    width: 148,
    render: (record) => (
      <span
        className={styles.primaryText}
        title={record.assetNumber || undefined}
      >
        {record.assetNumber || "-"}
      </span>
    ),
  },
  {
    key: "applicant",
    header: "신청자 정보",
    width: 176,
    render: (record) => <ApplicantCell record={record} />,
  },
  {
    key: "rentalType",
    header: "대여 유형",
    width: 76,
    render: (record) => (
      <span className={styles.primaryText}>{record.rentalType}</span>
    ),
  },
  {
    key: "requestDates",
    header: "신청일 / 수령일",
    width: 116,
    render: (record) => <RequestDatesCell record={record} />,
  },
  {
    key: "returnedDate",
    header: "반납일",
    width: 116,
    render: (record) => (
      <span className={styles.dateText}>
        <DateValue value={record.returnedDate} label="반납일" />
      </span>
    ),
  },
  {
    key: "status",
    header: "상태",
    width: 88,
    render: (record) => <HistoryStatusCell record={record} />,
  },
];

function AdminRentalHistoryPage() {
  const panelId = useId();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const params = { status: selectedStatus, keyword: searchTerm, page: currentPage - 1, size: ROWS_PER_PAGE };
  const historyQuery = useQuery({
    queryKey: rentalKeys.adminHistoryList(params),
    queryFn: ({ signal }) => getAdminRentalHistory({ ...params, signal }),
    enabled: isMockMode,
  });
  const countQuery = useQuery({
    queryKey: rentalKeys.adminHistoryCounts(),
    queryFn: ({ signal }) => getAdminRentalHistoryCounts({ signal }),
    enabled: isMockMode,
  });
  const counts = countQuery.data ?? {};
  const tabs = [
    { value: "all", label: "전체", count: counts.all ?? "-", controlsId: panelId },
    { value: "canceled", label: "신청 취소", count: counts.canceled ?? "-", controlsId: panelId },
    { value: "returned", label: "반납 완료", count: counts.returned ?? "-", controlsId: panelId },
  ];
  const data = historyQuery.data;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const emptyMessage = searchTerm.trim() ? "검색 조건에 해당하는 대여 기록이 없습니다." : selectedStatus === "all" ? "표시할 대여 기록이 없습니다." : `${tabs.find((tab) => tab.value === selectedStatus)?.label} 기록이 없습니다.`;

  return (
    <section className={styles.page}>
      <PageHeader />
      <div className={styles.contentViewport} role="region" aria-label="대여 기록 목록 영역">
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <Tabs className={styles.statusTabs} items={tabs} value={selectedStatus} onChange={(status) => { setSelectedStatus(status); setCurrentPage(1); }} ariaLabel="대여 기록 상태" />
            <SearchBar className={styles.search} name="rentalHistorySearch" width={360} value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} onSubmit={(value) => { setSearchTerm(value); setCurrentPage(1); }} ariaLabel="대여 기록 검색" placeholder="기자재명·모델명·비품번호·이름·학번 검색" />
          </div>
          <div id={panelId} className={styles.tablePanel} role="tabpanel" tabIndex={0}>
            {!isMockMode ? <p>대여 API가 아직 제공되지 않았습니다.</p> : null}
            {isMockMode && historyQuery.isPending ? <p>대여 기록을 불러오는 중입니다.</p> : null}
            {isMockMode && historyQuery.isError ? <p role="alert">{historyQuery.error?.message || "대여 기록을 불러오지 못했습니다."}</p> : null}
            {isMockMode && historyQuery.isSuccess ? <DataTable className={styles.dataTable} ariaLabel="관리자 대여 기록 목록" columns={HISTORY_COLUMNS} rows={data.content} getRowId={(record) => record.rentalId} minWidth={1120} emptyMessage={emptyMessage} /> : null}
          </div>
          {isMockMode && historyQuery.isSuccess ? <div className={styles.footer}><Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} ariaLabel="대여 기록 목록 페이지 이동" /></div> : null}
        </div>
      </div>
    </section>
  );
}

export default AdminRentalHistoryPage;
