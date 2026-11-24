import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode } from "../../api/client";
import { equipmentKeys } from "../../api/equipmentApi";
import { RENTAL_STATUS, getRentalStatus } from "../../constants/status";
import {
  getAdminRentalStatusCounts,
  getAdminRentalStatuses,
  pickupRental,
  rentalKeys,
  returnRental,
  studentRentalKeys,
  uploadAdminRentalImage,
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
  readyForPickup: { text: "수령 처리하기", kind: "fill", color: "Primary" },
  renting: { text: "반납 처리하기", kind: "fill", color: "Primary" },
  overdue: { text: "반납 처리하기", kind: "border", color: "Danger" },
};

async function uploadPhotos({ rentalId, processType, processPhoto }) {
  const imageType = processType === "pickup" ? "PICKUP" : "RETURN";
  const failedFiles = [];
  let firstError = null;
  for (const [index, image] of processPhoto.entries()) {
    const imageSide = index === 1 ? "BACK" : undefined;
    try {
      await uploadAdminRentalImage({ rentalId, imageType, image, imageSide });
    } catch (error) {
      failedFiles.push(image);
      firstError ??= error;
    }
  }

  return { failedFiles, firstError };
}

function AdminRentalStatusPage() {
  const queryClient = useQueryClient();
  const modalTriggerRef = useRef(null);
  const mutationGuardRef = useRef(false);
  const uploadedPhotoOperationsRef = useRef(new Set());
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailModalState, setDetailModalState] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [pendingPhotoUploads, setPendingPhotoUploads] = useState({});
  const params = { status: activeTab, keyword: searchTerm, size: 10 };

  const {
    items: statusItems,
    loadMoreRef,
    isLoading: isStatusLoading,
    isError: isStatusError,
    error: statusError,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteScroll({
    queryKey: rentalKeys.adminStatusList(params),
    queryFn: ({ pageParam, signal }) => getAdminRentalStatuses({ ...params, page: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
  const countQuery = useQuery({
    queryKey: rentalKeys.adminStatusCounts(),
    queryFn: ({ signal }) => getAdminRentalStatusCounts({ signal }),
  });

  const refreshRentals = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: rentalKeys.all }),
    queryClient.invalidateQueries({ queryKey: studentRentalKeys.all }),
    queryClient.invalidateQueries({ queryKey: ["admin", "members"] }),
    queryClient.invalidateQueries({ queryKey: equipmentKeys.all }),
  ]);

  const processMutation = useMutation({
    mutationFn: async (values) => {
      const photoOperationKey = `${values.rentalId}:${values.processType}`;
      let uploadResult = { failedFiles: [], firstError: null };

      if (!isMockMode && !values.skipPhotoUpload && values.processPhoto.length > 0) {
        uploadResult = await uploadPhotos(values);
        if (uploadResult.failedFiles.length > 0) {
          return { ...uploadResult, processCompleted: false };
        }
        uploadedPhotoOperationsRef.current.add(photoOperationKey);
      }

      await (values.processType === "pickup" ? pickupRental(values) : returnRental(values));
      uploadedPhotoOperationsRef.current.delete(photoOperationKey);
      return { ...uploadResult, processCompleted: true };
    },
    onSuccess: async ({ failedFiles, firstError, processCompleted }, variables) => {
      const rentalId = variables.rentalId;
      if (failedFiles.length > 0) {
        setPendingPhotoUploads((current) => ({
          ...current,
          [rentalId]: {
            rentalId,
            processType: variables.processType,
            files: failedFiles,
            message: `사진 ${failedFiles.length}장을 업로드하지 못해 처리를 진행하지 않았습니다. ${firstError?.message || "다시 시도해 주세요."}`,
          },
        }));
        return;
      } else {
        setPendingPhotoUploads((current) => {
          const next = { ...current };
          delete next[rentalId];
          return next;
        });
      }
      if (!processCompleted) return;

      await refreshRentals();
      setDetailModalState((current) => current?.rental.rentalId === rentalId ? null : current);
      setFeedbackType(variables.processType === "pickup" ? "pickup-success" : "return-success");
    },
    onSettled: () => { mutationGuardRef.current = false; },
  });

  const counts = countQuery.data ?? { all: null, readyForPickup: null, renting: null, overdue: 0 };
  const tabs = [
    {
      value: "all",
      label: "전체",
      count: counts.all ?? "-",
    },
    {
      value: "readyForPickup",
      label: RENTAL_STATUS.readyForPickup.label,
      count: counts.readyForPickup ?? "-",
    },
    {
      value: "renting",
      label: RENTAL_STATUS.renting.label,
      count: counts.renting ?? "-",
      badge: counts.overdue > 0 ? "⚠ 연체" : null,
    },
  ];

  const handleComplete = (values) => {
    if (mutationGuardRef.current) return;
    const retry = pendingPhotoUploads[values.rental.rentalId];
    const processType = retry?.processType ?? values.processType;
    const photoOperationKey = `${values.rental.rentalId}:${processType}`;
    const photosAlreadyUploaded = uploadedPhotoOperationsRef.current.has(photoOperationKey);
    mutationGuardRef.current = true;
    processMutation.mutate({
      rentalId: values.rental.rentalId,
      processPhoto: photosAlreadyUploaded ? [] : retry?.files ?? values.processPhoto,
      processType,
      workerName: values.workerName,
      skipPhotoUpload: photosAlreadyUploaded,
    });
  };

  const handleRetryPhotoUpload = (retry) => {
    if (mutationGuardRef.current) return;
    const photoOperationKey = `${retry.rentalId}:${retry.processType}`;
    const photosAlreadyUploaded = uploadedPhotoOperationsRef.current.has(photoOperationKey);
    mutationGuardRef.current = true;
    processMutation.mutate({
      rentalId: retry.rentalId,
      processPhoto: photosAlreadyUploaded ? [] : retry.files,
      processType: retry.processType,
      skipPhotoUpload: photosAlreadyUploaded,
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
          {Object.values(pendingPhotoUploads).map((retry) => (
            <div key={retry.rentalId} className={styles.uploadNotice} role="alert">
              <span>대여내역 {retry.rentalId}: {retry.message}</span>
              <Button kind="border" size="Default" color="Danger" status="Default" text={processMutation.isPending ? "재시도 중" : "사진 재시도"} disabled={processMutation.isPending} onClick={() => handleRetryPhotoUpload(retry)} />
            </div>
          ))}
          <section className={styles.cardListContainer} aria-label="대여 목록">
            {isStatusLoading ? <p>대여 목록을 불러오는 중입니다.</p> : null}
            {isStatusError ? <p role="alert">{statusError?.message || "대여 목록을 불러오지 못했습니다."}</p> : null}
            {countQuery.isError ? <p role="alert">상태별 개수를 불러오지 못했습니다.</p> : null}
            {!isStatusLoading && !isStatusError && statusItems.length === 0 ? <p>검색 조건에 해당하는 대여 현황이 없습니다.</p> : null}
            {statusItems.map((rental) => {
              const primary = primaryButtonByStatus[rental.status];
              const status = getRentalStatus(rental.status);
              return (
                <RentalCard
                  key={rental.rentalId}
                  imageSrc={rental.imageSrc}
                  imageAlt={rental.equipmentName}
                  ariaLabel={rental.ariaLabel}
                  badge={<StatusBadge text={status.label} color={status.color} size="lg" />}
                  actions={<>{primary ?
                    <Button kind={primary.kind} status="Default" size="Default" color={primary.color} text={primary.text} disabled={processMutation.isPending}
                      onClick={(event) => { modalTriggerRef.current = event.currentTarget; processMutation.reset(); setDetailModalState({ initialMode: "process", rental }); }}
                    /> : null}
                    <Button kind="border" status="Default" size="Default" color="Primary"
                      text="상세 보기" disabled={processMutation.isPending}
                      onClick={(event) => {
                        modalTriggerRef.current = event.currentTarget;
                        processMutation.reset();
                        setDetailModalState({ initialMode: "detail", rental });
                      }}
                    />
                  </>}>
                  <RentalCardInfo category={rental.category} equipmentName={rental.equipmentName} rentalId={rental.rentalId} fields={rental.infoFields} />
                </RentalCard>
              );
            })}
            <div ref={loadMoreRef} aria-hidden="true" />
            {isFetchingNextPage ? <p>더 불러오는 중...</p> : null}
            {!hasNextPage && statusItems.length > 0 ? <p>마지막 목록입니다.</p> : null}
          </section>
        </div>
      </div>

      {detailModalState ? <RentalDetailModal key={`${detailModalState.rental.rentalId}-${detailModalState.initialMode}`} isOpen initialMode={detailModalState.initialMode} rental={detailModalState.rental} workerName={user?.name ?? ""} isPending={processMutation.isPending} error={processMutation.error} uploadRetry={pendingPhotoUploads[detailModalState.rental.rentalId]} onClose={() => { if (!processMutation.isPending) setDetailModalState(null); }} onComplete={handleComplete} returnFocusRef={modalTriggerRef} /> : null}
      <ConfirmModal isOpen={feedbackType === "pickup-success"} icon="checkmark" title="수령 처리되었습니다." description="대여중 상태에서 확인 가능합니다." confirmText="확인" showCancel={false} onClose={() => setFeedbackType(null)} onConfirm={() => setFeedbackType(null)} returnFocusRef={modalTriggerRef} />
      <ConfirmModal isOpen={feedbackType === "return-success"} icon="checkmark" title="반납 처리되었습니다." description="대여기록 페이지에서 확인 가능합니다." confirmText="확인" showCancel={false} onClose={() => setFeedbackType(null)} onConfirm={() => setFeedbackType(null)} returnFocusRef={modalTriggerRef} />
    </div>
  );
}

export default AdminRentalStatusPage;
