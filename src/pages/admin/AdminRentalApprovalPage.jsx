import { useRef, useState } from "react";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import ConfirmModal from "../../components/modal/ConfirmModal";
import RentalRejectModal from "../../components/modal/RentalRejectModal";
import DataTable from "../../components/table/DataTable";
import styles from "./AdminRentalApprovalPage.module.css";

const REQUEST_TEMPLATES = [
  {
    studentName: "김홍익",
    department: "컴퓨터공학과",
    category: "노트북",
    equipmentName: "HP Elite x360 1040 G10 2-in-1",
    reason: "캡스톤 디자인 프로젝트 발표 준비",
    rentalType: "장기",
    startDate: "2026.08.25",
    endDate: "2026.08.29",
    requestedTime: "09:30:00",
  },
  {
    studentName: "이홍익",
    department: "시각디자인과",
    category: "카메라",
    equipmentName: "Sony Alpha A7 IV",
    reason: "졸업 작품 영상 촬영",
    rentalType: "단기",
    startDate: "2026.08.26",
    endDate: "2026.08.28",
    requestedTime: "10:15:00",
  },
  {
    studentName: "박홍익",
    department: "산업디자인과",
    category: "태블릿",
    equipmentName: "iPad Pro 12.9",
    reason: "UX 프로토타입 사용성 테스트",
    rentalType: "단기",
    startDate: "2026.08.24",
    endDate: "2026.08.27",
    requestedTime: "14:20:00",
  },
  {
    studentName: "최홍익",
    department: "영상애니메이션학부",
    category: "음향기기",
    equipmentName: "Zoom H6 Recorder",
    reason: "단편 영화 음향 녹음",
    rentalType: "장기",
    startDate: "2026.08.23",
    endDate: "2026.08.30",
    requestedTime: "16:40:00",
  },
  {
    studentName: "정홍익",
    department: "전자전기공학부",
    category: "프로젝터",
    equipmentName: "Epson EB-2250U",
    reason: "학과 세미나 발표",
    rentalType: "단기",
    startDate: "2026.08.27",
    endDate: "2026.08.27",
    requestedTime: "11:05:00",
  },
];

// 화면과 클라이언트 동작 확인용 임시 데이터
// 실제 API 응답 구조나 서버 상태값을 의미하지 않음
const INITIAL_APPROVAL_REQUESTS = Array.from({ length: 99 }, (_, index) => {
  const template = REQUEST_TEMPLATES[index % REQUEST_TEMPLATES.length];

  const sequence = index + 1;

  const requestedDay = String(22 - (index % 7)).padStart(2, "0");

  return {
    ...template,
    id: `approval-request-${sequence}`,
    studentId: `C${String(sequence).padStart(6, "0")}`,
    requestedDate: `2026.08.${requestedDay}`,
  };
});

const INITIAL_SELECTED_REQUEST_IDS = INITIAL_APPROVAL_REQUESTS.slice(0, 4).map(
  (request) => request.id,
);

const ROWS_PER_PAGE = 10;

function ApplicantCell({ request }) {
  return (
    <div className={styles.applicantCell}>
      <span className={styles.userAvatar} aria-hidden="true">
        <img src="/icons/icon24/user.png" alt="" />
      </span>

      <span className={styles.cellStack}>
        <strong className={styles.applicantName}>{request.studentName}</strong>

        <span className={styles.secondaryText}>{request.studentId}</span>

        <span className={styles.tertiaryText}>{request.department}</span>
      </span>
    </div>
  );
}

function EquipmentCell({ request }) {
  return (
    <span className={styles.cellStack}>
      <span className={styles.primaryText} title={request.equipmentName}>
        {request.equipmentName}
      </span>

      <span className={styles.secondaryText}>{request.category}</span>
    </span>
  );
}

function MultilineCell({ lines }) {
  return (
    <span className={styles.cellStack}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className={styles.primaryText}>
          {line}
        </span>
      ))}
    </span>
  );
}

function AdminRentalApprovalPage() {
  const [selectedRequestIds, setSelectedRequestIds] = useState(
    INITIAL_SELECTED_REQUEST_IDS,
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const approvalButtonRef = useRef(null);

  const rejectButtonRef = useRef(null);

  const [approvalTargetRequestIds, setApprovalTargetRequestIds] = useState([]);

  const [rejectTargetRequest, setRejectTargetRequest] = useState(null);

  const [rejectionReason, setRejectionReason] = useState("out-of-stock");

  const isApprovalModalOpen = approvalTargetRequestIds.length > 0;

  const isRejectModalOpen = rejectTargetRequest !== null;

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredRequests = INITIAL_APPROVAL_REQUESTS.filter((request) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    return [request.studentName, request.studentId, request.equipmentName].some(
      (value) => value.toLowerCase().includes(normalizedSearchTerm),
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / ROWS_PER_PAGE),
  );

  const resolvedCurrentPage = Math.min(currentPage, totalPages);

  const pageStartIndex = (resolvedCurrentPage - 1) * ROWS_PER_PAGE;

  const visibleRequests = filteredRequests.slice(
    pageStartIndex,
    pageStartIndex + ROWS_PER_PAGE,
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
    setSelectedRequestIds([]);
  };

  const handleOpenApprovalModal = () => {
    if (selectedRequestIds.length === 0) {
      return;
    }

    setApprovalTargetRequestIds([...selectedRequestIds]);
  };

  const handleCloseApprovalModal = () => {
    setApprovalTargetRequestIds([]);
  };

  const handleConfirmApproval = () => {
    // 실제 승인 API와 목록 상태 변경은 아직 연결하지 않는다.
    // 현재 단계에서는 기존 선택 상태를 유지하고 모달만 닫는다.
    setApprovalTargetRequestIds([]);
  };

  const handleOpenRejectModal = (request, event) => {
    rejectButtonRef.current = event.currentTarget;
    setRejectionReason("out-of-stock");
    setRejectTargetRequest(request);
  };

  const handleCloseRejectModal = () => {
    setRejectTargetRequest(null);
  };

  const handleConfirmReject = () => {
    // 실제 반려 API, 목록 상태 변경, 완료 표시는 아직 연결하지 않는다.
    // 현재 단계에서는 체크 선택 상태를 유지하고 모달만 닫는다.
    setRejectTargetRequest(null);
  };

  const columns = [
    {
      key: "applicant",
      header: "신청자 정보",
      width: 168,
      render: (request) => <ApplicantCell request={request} />,
    },
    {
      key: "equipment",
      header: "기자재 정보",
      width: 176,
      render: (request) => <EquipmentCell request={request} />,
    },
    {
      key: "reason",
      header: "대여 사유",
      width: 280,
      render: (request) => (
        <span className={styles.singleLineText} title={request.reason}>
          {request.reason}
        </span>
      ),
    },
    {
      key: "rentalType",
      header: "유형",
      width: 96,
      getValue: (request) => request.rentalType,
    },
    {
      key: "rentalPeriod",
      header: "대여 기간",
      width: 136,
      render: (request) => (
        <MultilineCell lines={[request.startDate, `~${request.endDate}`]} />
      ),
    },
    {
      key: "requestedAt",
      header: "신청 일시",
      width: 136,
      render: (request) => (
        <MultilineCell lines={[request.requestedDate, request.requestedTime]} />
      ),
    },
    {
      key: "reject",
      header: "반려",
      width: 64,
      render: (request) => (
        <Button
          kind="border"
          size="small"
          color="Danger"
          status="Default"
          text="반려"
          aria-label={`${request.studentName}님의 ${request.equipmentName} 대여 신청 반려`}
          onClick={(event) => handleOpenRejectModal(request, event)}
        />
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>대여신청 승인</h1>

      <div
        className={styles.contentViewport}
        role="region"
        aria-label="대여 신청 승인 목록 영역"
      >
        <div className={styles.content}>
          <DataTable
            ariaLabel="대여 신청 승인 목록"
            columns={columns}
            rows={visibleRequests}
            totalCount={filteredRequests.length}
            selectedRowIds={selectedRequestIds}
            onSelectedRowIdsChange={setSelectedRequestIds}
            getRowId={(request) => request.id}
            getRowLabel={(request) =>
              `${request.studentName}님의 ${request.equipmentName} 대여 신청`
            }
            emptyMessage="검색 조건에 해당하는 대여 신청이 없습니다."
            bulkAction={
              <Button
                ref={approvalButtonRef}
                kind="fill"
                size="Default"
                color="Primary"
                status="Default"
                text="신청 승인"
                disabled={selectedRequestIds.length === 0}
                onClick={handleOpenApprovalModal}
              />
            }
            search={
              <SearchBar
                width={360}
                value={searchTerm}
                ariaLabel="대여 신청 검색어"
                placeholder="학생명, 학번 또는 기자재명으로 검색..."
                onChange={handleSearchChange}
                onSubmit={() => setCurrentPage(1)}
              />
            }
            pagination={
              <Pagination
                page={resolvedCurrentPage}
                totalPages={totalPages}
                onChange={setCurrentPage}
                ariaLabel="대여 신청 목록 페이지 이동"
              />
            }
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isApprovalModalOpen}
        icon="help"
        title={
          <>
            선택한{" "}
            <span className={styles.approvalCount}>
              {approvalTargetRequestIds.length}건
            </span>
            을 승인처리하시겠습니까?
          </>
        }
        description="승인 후에는 ‘수령 대기’ 상태로 전환됩니다."
        cancelText="취소"
        confirmText="확인"
        confirmColor="Primary"
        onClose={handleCloseApprovalModal}
        onConfirm={handleConfirmApproval}
        returnFocusRef={approvalButtonRef}
      />

      <RentalRejectModal
        isOpen={isRejectModalOpen}
        request={rejectTargetRequest}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
        returnFocusRef={rejectButtonRef}
      />
    </div>
  );
}

export default AdminRentalApprovalPage;
