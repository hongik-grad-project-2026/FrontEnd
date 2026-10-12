import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode } from "../../api/client";
import {
  approveRental,
  getAdminRentalApprovals,
  rejectRental,
  rentalKeys,
  studentRentalKeys,
} from "../../api/rentalApi";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import ConfirmModal from "../../components/modal/ConfirmModal";
import RentalRejectModal from "../../components/modal/RentalRejectModal";
import DataTable from "../../components/table/DataTable";
import styles from "./AdminRentalApprovalPage.module.css";

const ROWS_PER_PAGE = 10;

function CellStack({ children }) {
  return <span className={styles.cellStack}>{children}</span>;
}

function ApplicantCell({ request }) {
  return (
    <div className={styles.applicantCell}>
      <span className={styles.userAvatar} aria-hidden="true">
        <img src="/icons/icon24/user.png" alt="" />
      </span>
      <CellStack>
        <strong className={styles.applicantName}>{request.studentName}</strong>
        <span className={styles.secondaryText}>{request.studentId}</span>
        <span className={styles.tertiaryText}>{request.department}</span>
      </CellStack>
    </div>
  );
}

function AdminRentalApprovalPage() {
  const queryClient = useQueryClient();
  const mutationGuardRef = useRef(false);
  const approvalButtonRef = useRef(null);
  const rejectButtonRef = useRef(null);
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [approvalTargetRequestIds, setApprovalTargetRequestIds] = useState([]);
  const [rejectTargetRequest, setRejectTargetRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("out-of-stock");
  const [actionError, setActionError] = useState("");
  const params = { keyword: searchTerm, page: currentPage - 1, size: ROWS_PER_PAGE };

  const approvalQuery = useQuery({
    queryKey: rentalKeys.adminApprovalList(params),
    queryFn: ({ signal }) => getAdminRentalApprovals({ ...params, signal }),
    enabled: isMockMode,
  });

  const refreshRentals = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: rentalKeys.all }),
      queryClient.invalidateQueries({ queryKey: studentRentalKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] }),
    ]);

  const approvalMutation = useMutation({
    mutationFn: async (rentalIds) => {
      const results = await Promise.allSettled(
        rentalIds.map((rentalId) => approveRental({ rentalId })),
      );
      return rentalIds.reduce(
        (summary, rentalId, index) => {
          summary[results[index].status === "fulfilled" ? "succeeded" : "failed"].push(rentalId);
          return summary;
        },
        { succeeded: [], failed: [] },
      );
    },
    onSuccess: async ({ failed }) => {
      await refreshRentals();
      setSelectedRequestIds(failed);
      setApprovalTargetRequestIds([]);
      setActionError(failed.length ? `${failed.length}건을 승인하지 못했습니다. 실패한 신청을 다시 선택해 처리해 주세요.` : "");
    },
    onSettled: () => { mutationGuardRef.current = false; },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRental,
    onSuccess: async (_data, variables) => {
      await refreshRentals();
      setSelectedRequestIds((ids) => ids.filter((id) => id !== variables.rentalId));
      setRejectTargetRequest(null);
      setActionError("");
    },
    onSettled: () => { mutationGuardRef.current = false; },
  });

  const handleConfirmApproval = () => {
    if (!isMockMode || mutationGuardRef.current || approvalTargetRequestIds.length === 0) return;
    mutationGuardRef.current = true;
    setActionError("");
    approvalMutation.mutate(approvalTargetRequestIds);
  };

  const handleConfirmReject = (request, reason) => {
    if (!isMockMode || mutationGuardRef.current) return;
    mutationGuardRef.current = true;
    setActionError("");
    rejectMutation.mutate({ rentalId: request.rentalId, reason });
  };

  const columns = [
    { key: "applicant", header: "신청자 정보", width: 168, render: (request) => <ApplicantCell request={request} /> },
    { key: "equipment", header: "기자재 정보", width: 176, render: (request) => <CellStack><span className={styles.primaryText} title={request.equipmentName}>{request.equipmentName}</span><span className={styles.secondaryText}>{request.category}</span></CellStack> },
    { key: "reason", header: "대여 사유", width: 280, render: (request) => <span className={styles.singleLineText} title={request.reason}>{request.reason}</span> },
    { key: "rentalType", header: "유형", width: 96, getValue: (request) => request.rentalType },
    { key: "period", header: "대여 기간", width: 136, render: (request) => <CellStack><span>{request.startDate}</span><span>~{request.endDate}</span></CellStack> },
    { key: "requestedAt", header: "신청 일시", width: 136, render: (request) => <CellStack><span>{request.requestedDate}</span><span>{request.requestedTime}</span></CellStack> },
    { key: "reject", header: "반려", width: 64, render: (request) => <Button kind="border" size="small" color="Danger" status="Default" text="반려" disabled={approvalMutation.isPending || rejectMutation.isPending} onClick={(event) => { rejectButtonRef.current = event.currentTarget; setRejectionReason("out-of-stock"); rejectMutation.reset(); setRejectTargetRequest(request); }} /> },
  ];

  const pageData = approvalQuery.data;
  const totalPages = Math.max(pageData?.totalPages ?? 1, 1);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>대여신청 승인</h1>
      <div className={styles.contentViewport} role="region" aria-label="대여 신청 승인 목록 영역">
        <div className={styles.content}>
          {!isMockMode ? <p>대여 API가 아직 제공되지 않았습니다.</p> : null}
          {isMockMode && approvalQuery.isPending ? <p>대여 신청을 불러오는 중입니다.</p> : null}
          {isMockMode && approvalQuery.isError ? <p role="alert">{approvalQuery.error?.message || "대여 신청을 불러오지 못했습니다."}</p> : null}
          {actionError ? <p role="alert">{actionError}</p> : null}
          {isMockMode && approvalQuery.isSuccess ? (
            <DataTable
              ariaLabel="대여 신청 승인 목록"
              columns={columns}
              rows={pageData.content}
              totalCount={pageData.totalElements}
              selectedRowIds={selectedRequestIds}
              onSelectedRowIdsChange={setSelectedRequestIds}
              getRowId={(request) => request.rentalId}
              emptyMessage="검색 조건에 해당하는 대여 신청이 없습니다."
              bulkAction={<Button ref={approvalButtonRef} kind="fill" size="Default" color="Primary" status="Default" text="신청 승인" disabled={selectedRequestIds.length === 0 || approvalMutation.isPending || rejectMutation.isPending} onClick={() => setApprovalTargetRequestIds([...selectedRequestIds])} />}
              search={<SearchBar width={360} value={searchTerm} ariaLabel="대여 신청 검색어" placeholder="학생명, 학번 또는 기자재명으로 검색..." onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); setSelectedRequestIds([]); }} onSubmit={() => setCurrentPage(1)} />}
              pagination={<Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} ariaLabel="대여 신청 목록 페이지 이동" />}
            />
          ) : null}
        </div>
      </div>

      <ConfirmModal
        isOpen={approvalTargetRequestIds.length > 0}
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
        confirmText={approvalMutation.isPending ? "처리 중" : "확인"}
        confirmColor="Primary"
        actionsDisabled={approvalMutation.isPending}
        closeOnEscape={!approvalMutation.isPending}
        closeOnOverlay={!approvalMutation.isPending}
        onClose={() => { if (!approvalMutation.isPending) setApprovalTargetRequestIds([]); }}
        onConfirm={handleConfirmApproval}
        returnFocusRef={approvalButtonRef}
      />

      <RentalRejectModal
        isOpen={Boolean(rejectTargetRequest)}
        request={rejectTargetRequest}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        isPending={rejectMutation.isPending}
        error={rejectMutation.error}
        onClose={() => { if (!rejectMutation.isPending) setRejectTargetRequest(null); }}
        onConfirm={handleConfirmReject}
        returnFocusRef={rejectButtonRef}
      />
    </div>
  );
}

export default AdminRentalApprovalPage;
