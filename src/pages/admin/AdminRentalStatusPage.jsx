import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode } from "../../api/client";
import {
  getAdminRentalStatusCounts,
  getAdminRentalStatuses,
  pickupRental,
  rentalKeys,
  returnRental,
  studentRentalKeys,
} from "../../api/rentalApi";
import { useUser } from "../../context/UserContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import RentalCard from "../../components/card/RentalCard";
import RentalCardInfo from "../../components/card/RentalCardInfo";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/layout/PageHeader";
import ConfirmModal from "../../components/modal/ConfirmModal";
import RentalDetailModal from "../../components/modal/RentalDetailModal";
import styles from "./AdminRentalStatusPage.module.css";

const primaryButtonByStatus = {
  waiting: { text: "수령 처리하기", kind: "fill", color: "Primary" },
  renting: { text: "반납 처리하기", kind: "fill", color: "Primary" },
  overdue: { text: "반납 처리하기", kind: "border", color: "Danger" },
};
const badgeStatusByRentalStatus = {
  waiting: "대여-수령대기",
  renting: "대여-대여중",
  overdue: "대여-연체",
};

function AdminRentalStatusPage() {
  const queryClient = useQueryClient();
  const modalTriggerRef = useRef(null);
  const mutationGuardRef = useRef(false);
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailModalState, setDetailModalState] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const params = { status: activeTab, keyword: searchTerm, size: 10 };

  const statusQuery = useInfiniteScroll({
    enabled: isMockMode,
    queryKey: rentalKeys.adminStatusList(params),
    queryFn: ({ pageParam, signal }) => getAdminRentalStatuses({ ...params, page: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
  const countQuery = useQuery({
    queryKey: rentalKeys.adminStatusCounts(),
    queryFn: ({ signal }) => getAdminRentalStatusCounts({ signal }),
    enabled: isMockMode,
  });

  const refreshRentals = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: rentalKeys.all }),
    queryClient.invalidateQueries({ queryKey: studentRentalKeys.all }),
    queryClient.invalidateQueries({ queryKey: ["admin", "members"] }),
  ]);

  const processMutation = useMutation({
    mutationFn: (values) => values.processType === "pickup" ? pickupRental(values) : returnRental(values),
    onSuccess: async (_data, variables) => {
      await refreshRentals();
      setDetailModalState(null);
      setFeedbackType(variables.processType === "pickup" ? "pickup-success" : "return-success");
    },
    onSettled: () => { mutationGuardRef.current = false; },
  });

  const counts = countQuery.data ?? { all: null, waiting: null, renting: null, overdue: 0 };
  const tabs = [
    { value: "all", label: "전체", count: counts.all ?? "-" },
    { value: "waiting", label: "수령대기", count: counts.waiting ?? "-" },
    { value: "renting", label: "대여중", count: counts.renting ?? "-", badge: counts.overdue > 0 ? "⚠ 연체" : null },
  ];

  const handleComplete = (values) => {
    if (mutationGuardRef.current) return;
    mutationGuardRef.current = true;
    processMutation.mutate({
      rentalId: values.rental.rentalId,
      processPhoto: values.processPhoto,
      processType: values.processType,
      workerName: values.workerName,
    });
  };

  return (
    <div className={styles.adminRentalStatusPage}>
      <PageHeader />
      <div className={styles.contentViewport} role="region" aria-label="대여 현황 목록 영역">
        <div className={styles.content}>
          <div className={styles.toolsContainer}>
            <Tabs className={styles.statusTabs} items={tabs} value={activeTab} onChange={setActiveTab} ariaLabel="대여 현황" />
            <SearchBar className={styles.search} name="rentalStatusSearch" width={360} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onSubmit={setSearchTerm} ariaLabel="대여 현황 검색" placeholder="기자재명·학생명·학번·비품번호 검색..." />
          </div>
          <section className={styles.cardListContainer} aria-label="대여 목록">
            {!isMockMode ? <p>대여 API가 아직 제공되지 않았습니다.</p> : null}
            {isMockMode && statusQuery.isLoading ? <p>대여 목록을 불러오는 중입니다.</p> : null}
            {isMockMode && statusQuery.isError ? <p role="alert">대여 목록을 불러오지 못했습니다.</p> : null}
            {isMockMode && !statusQuery.isLoading && !statusQuery.isError && statusQuery.items.length === 0 ? <p>검색 조건에 해당하는 대여 현황이 없습니다.</p> : null}
            {isMockMode ? statusQuery.items.map((rental) => {
              const primary = primaryButtonByStatus[rental.status];
              return (
                <RentalCard key={rental.rentalId} ariaLabel={rental.ariaLabel} badge={<StatusBadge status={badgeStatusByRentalStatus[rental.status]} />} actions={<><Button kind={primary.kind} status="Default" size="Default" color={primary.color} text={primary.text} disabled={processMutation.isPending} onClick={(event) => { modalTriggerRef.current = event.currentTarget; processMutation.reset(); setDetailModalState({ initialMode: "process", rental }); }} /><Button kind="border" status="Default" size="Default" color="Primary" text="상세 보기" disabled={processMutation.isPending} onClick={(event) => { modalTriggerRef.current = event.currentTarget; processMutation.reset(); setDetailModalState({ initialMode: "detail", rental }); }} /></>}>
                  <RentalCardInfo category={rental.category} equipmentName={rental.equipmentName} rentalId={rental.rentalId} fields={rental.infoFields} />
                </RentalCard>
              );
            }) : null}
            {isMockMode ? <div ref={statusQuery.loadMoreRef} aria-hidden="true" /> : null}
            {statusQuery.isFetchingNextPage ? <p>더 불러오는 중...</p> : null}
            {isMockMode && !statusQuery.hasNextPage && statusQuery.items.length > 0 ? <p>마지막 목록입니다.</p> : null}
          </section>
        </div>
      </div>

      {detailModalState ? <RentalDetailModal key={`${detailModalState.rental.rentalId}-${detailModalState.initialMode}`} isOpen initialMode={detailModalState.initialMode} rental={detailModalState.rental} workerName={user?.name ?? ""} isPending={processMutation.isPending} error={processMutation.error} onClose={() => { if (!processMutation.isPending) setDetailModalState(null); }} onComplete={handleComplete} returnFocusRef={modalTriggerRef} /> : null}
      <ConfirmModal isOpen={feedbackType === "pickup-success"} icon="checkmark" title="수령 처리되었습니다." description="대여중 상태에서 확인 가능합니다." confirmText="확인" showCancel={false} onClose={() => setFeedbackType(null)} onConfirm={() => setFeedbackType(null)} returnFocusRef={modalTriggerRef} />
      <ConfirmModal isOpen={feedbackType === "return-success"} icon="checkmark" title="반납 처리되었습니다." description="대여기록 페이지에서 확인 가능합니다." confirmText="확인" showCancel={false} onClose={() => setFeedbackType(null)} onConfirm={() => setFeedbackType(null)} returnFocusRef={modalTriggerRef} />
    </div>
  );
}

export default AdminRentalStatusPage;
