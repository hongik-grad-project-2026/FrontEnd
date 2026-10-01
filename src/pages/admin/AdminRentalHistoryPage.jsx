import { useId, useState } from "react";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";
import styles from "./AdminRentalHistoryPage.module.css";

const ROWS_PER_PAGE = 10;

const HISTORY_STATUSES = [
  { value: "canceled", label: "신청 취소" },
  { value: "returned", label: "반납 완료" },
];

const STATUS_BADGES = {
  canceled: "대여-신청취소",
  returned: "대여-반납완료",
};

const MOCK_RENTAL_HISTORY = [
  {
    id: "mock-history-001",
    status: "canceled",
    imageSrc: null,
    equipmentName: "화면 확인용 노트북 A",
    modelName: "MOCK-LAPTOP-A",
    category: "노트북",
    os: "Windows",
    assetNumber: null,
    studentName: "김예시",
    studentId: "C000001",
    department: "컴퓨터공학과",
    rentalType: "장기",
    requestedDate: "2026.08.25",
    pickupDate: null,
    returnedDate: null,
  },
  {
    id: "mock-history-002",
    status: "returned",
    imageSrc: null,
    equipmentName: "화면 확인용 긴 기자재명과 말줄임을 확인하는 노트북 B",
    modelName: "MOCK-LAPTOP-B-LONG-MODEL-NAME",
    category: "노트북",
    os: "Windows",
    assetNumber: "MOCK-ASSET-LONG-NUMBER-0002",
    studentName: "이예시",
    studentId: "C000002",
    department: "긴 학과명 표시를 확인하는 기계·시스템디자인공학과",
    rentalType: "장기",
    requestedDate: "2026.08.20",
    pickupDate: "2026.08.21",
    returnedDate: "2026.08.28",
  },
  {
    id: "mock-history-003",
    status: "returned",
    imageSrc: null,
    equipmentName: "화면 확인용 태블릿 A",
    modelName: "MOCK-TABLET-A",
    category: "태블릿",
    os: "Android",
    assetNumber: "MOCK-0003",
    studentName: "박예시",
    studentId: "C000003",
    department: "시각디자인과",
    rentalType: "장기",
    requestedDate: "2026.08.18",
    pickupDate: "2026.08.19",
    returnedDate: "2026.08.26",
  },
  {
    id: "mock-history-004",
    status: "canceled",
    imageSrc: null,
    equipmentName: "화면 확인용 태블릿 B",
    modelName: "MOCK-TABLET-B",
    category: "태블릿",
    os: "iPadOS",
    assetNumber: null,
    studentName: "최예시",
    studentId: "C000004",
    department: "산업디자인과",
    rentalType: "장기",
    requestedDate: "2026.08.17",
    pickupDate: null,
    returnedDate: null,
  },
  {
    id: "mock-history-005",
    status: "returned",
    imageSrc: null,
    equipmentName: "화면 확인용 키보드/마우스 A",
    modelName: null,
    category: "키보드/마우스",
    os: null,
    assetNumber: "MOCK-0005",
    studentName: "정예시",
    studentId: "C000005",
    department: "전자전기공학부",
    rentalType: "장기",
    requestedDate: "2026.08.15",
    pickupDate: "2026.08.16",
    returnedDate: "2026.08.23",
  },
  {
    id: "mock-history-006",
    status: "returned",
    imageSrc: null,
    equipmentName: "화면 확인용 키보드/마우스 B",
    modelName: "MOCK-INPUT-B",
    category: "키보드/마우스",
    os: null,
    assetNumber: "MOCK-0006",
    studentName: "강예시",
    studentId: "C000006",
    department: "컴퓨터공학과",
    rentalType: "장기",
    requestedDate: "2026.08.13",
    pickupDate: "2026.08.14",
    returnedDate: "2026.08.21",
  },
  {
    id: "mock-history-007",
    status: "canceled",
    imageSrc: null,
    equipmentName: "화면 확인용 보조배터리 A",
    modelName: "MOCK-BATTERY-A",
    category: "보조배터리",
    os: null,
    assetNumber: null,
    studentName: "윤예시",
    studentId: "C000007",
    department: "영상애니메이션학부",
    rentalType: "장기",
    requestedDate: "2026.08.12",
    pickupDate: null,
    returnedDate: null,
  },
  {
    id: "mock-history-008",
    status: "returned",
    imageSrc: null,
    equipmentName: "화면 확인용 보조배터리 B",
    modelName: "MOCK-BATTERY-B",
    category: "보조배터리",
    os: null,
    assetNumber: "MOCK-0008",
    studentName: "장예시",
    studentId: "C000008",
    department: "시각디자인과",
    rentalType: "장기",
    requestedDate: "2026.08.10",
    pickupDate: "2026.08.11",
    returnedDate: "2026.08.18",
  },
  {
    id: "mock-history-009",
    status: "returned",
    imageSrc: null,
    equipmentName: "화면 확인용 노트북 거치대",
    modelName: "MOCK-LAPTOP-STAND",
    category: "노트북 거치대",
    os: null,
    assetNumber: "MOCK-0009",
    studentName: "임예시",
    studentId: "C000009",
    department: "건축학부",
    rentalType: "장기",
    requestedDate: "2026.08.08",
    pickupDate: "2026.08.09",
    returnedDate: "2026.08.16",
  },
  {
    id: "mock-history-010",
    status: "canceled",
    imageSrc: null,
    equipmentName: "화면 확인용 독서대 A",
    modelName: "MOCK-BOOK-STAND-A",
    category: "독서대",
    os: null,
    assetNumber: null,
    studentName: "한예시",
    studentId: "C000010",
    department: "경영학부",
    rentalType: "장기",
    requestedDate: "2026.08.07",
    pickupDate: null,
    returnedDate: null,
  },
  {
    id: "mock-history-011",
    status: "returned",
    imageSrc: null,
    equipmentName: "화면 확인용 독서대 B",
    modelName: "MOCK-BOOK-STAND-B",
    category: "독서대",
    os: null,
    assetNumber: "MOCK-0011",
    studentName: "오예시",
    studentId: "C000011",
    department: "교육학과",
    rentalType: "장기",
    requestedDate: "2026.08.01",
    pickupDate: "2026.08.02",
    returnedDate: "2026.08.09",
  },
];

function normalizeSearchValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function EquipmentCell({ record }) {
  return (
    <div className={styles.equipmentCell}>
      {/* 옆의 기자재명과 중복되므로 이미지 영역은 장식 요소. */}
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

// 이 페이지 목업의 YYYY.MM.DD 문자열 또는 null만 지원합니다.
// 문자열 치환은 dateTime 표시용이며 범용 API 날짜 변환이 아닙니다.
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

// DataTable의 오른쪽 셀 여백 16px을 포함한 열 너비
// 첫 열은 왼쪽 여백·이미지·기자재명을 하나의 셀로 묶음
// 전체 열 너비의 합은 1120px
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

  // 탭 숫자는 검색 전 전체 목업을 상태별로 집계한 값
  const tabItems = [
    {
      value: "all",
      label: "전체",
      count: MOCK_RENTAL_HISTORY.length,
      controlsId: panelId,
    },
    ...HISTORY_STATUSES.map((status) => ({
      ...status,
      count: MOCK_RENTAL_HISTORY.filter(
        (record) => record.status === status.value,
      ).length,
      controlsId: panelId,
    })),
  ];

  const selectedStatusLabel =
    tabItems.find((item) => item.value === selectedStatus)?.label ?? "전체";

  const normalizedSearchTerm = normalizeSearchValue(searchTerm);

  // 상태 필터 → 검색 필터 → 페이지 분할 순서로 적용
  // 별도 정렬 UI가 없으므로 목업 배열의 순서를 유지
  const filteredRecords = MOCK_RENTAL_HISTORY.filter((record) => {
    const matchesStatus =
      selectedStatus === "all" || record.status === selectedStatus;

    const matchesSearch =
      !normalizedSearchTerm ||
      [
        record.equipmentName,
        record.modelName,
        record.assetNumber,
        record.studentName,
        record.studentId,
      ].some((value) =>
        normalizeSearchValue(value).includes(normalizedSearchTerm),
      );

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / ROWS_PER_PAGE),
  );

  const resolvedCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const pageStartIndex = (resolvedCurrentPage - 1) * ROWS_PER_PAGE;

  const visibleRecords = filteredRecords.slice(
    pageStartIndex,
    pageStartIndex + ROWS_PER_PAGE,
  );

  const handleStatusChange = (nextStatus) => {
    setSelectedStatus(nextStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  // Enter와 검색 버튼에도 동일한 검색 조건을 적용
  // SearchBar의 기본 alert가 실행되지 않도록 명시적으로 전달
  const handleSearchSubmit = (inputText) => {
    setSearchTerm(inputText);
    setCurrentPage(1);
  };

  const emptyMessage = normalizedSearchTerm
    ? "검색 조건에 해당하는 대여 기록이 없습니다."
    : selectedStatus === "all"
      ? "표시할 대여 기록이 없습니다."
      : `${selectedStatusLabel} 기록이 없습니다.`;

  return (
    <section className={styles.page}>
      <PageHeader />

      <div
        className={styles.contentViewport}
        role="region"
        aria-label="대여 기록 목록 영역"
      >
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <Tabs
              className={styles.statusTabs}
              items={tabItems}
              value={selectedStatus}
              onChange={handleStatusChange}
              ariaLabel="대여 기록 상태"
            />

            <SearchBar
              className={styles.search}
              name="rentalHistorySearch"
              width={360}
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              ariaLabel="기자재명, 모델명, 비품번호, 신청자 이름 또는 학번 검색"
              placeholder="기자재명·모델명·비품번호·이름·학번 검색"
            />
          </div>

          <div
            id={panelId}
            className={styles.tablePanel}
            role="tabpanel"
            aria-label={`${selectedStatusLabel} 대여 기록 목록`}
            tabIndex={0}
          >
            {/* 상세 Modal과 행 클릭은 이번 목록 구현에 연결하지 않는다 */}
            <DataTable
              className={styles.dataTable}
              ariaLabel="관리자 대여 기록 목록"
              columns={HISTORY_COLUMNS}
              rows={visibleRecords}
              getRowId={(record) => record.id}
              minWidth={1120}
              emptyMessage={emptyMessage}
            />
          </div>

          <div className={styles.footer}>
            <Pagination
              page={resolvedCurrentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
              ariaLabel="대여 기록 목록 페이지 이동"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminRentalHistoryPage;
