import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  deleteNotice,
  downloadNoticeAttachment,
  fetchNoticeDetail,
  noticeKeys,
  updateNotice,
} from "../../api/noticeApi";
import AttachmentItem from "../../components/common/AttachmentItem";
import Button from "../../components/common/Button";
import { IconTextButton } from "../../components/common/IconButton";
import ToggleButton from "../../components/common/ToggleButton";
import PageHeader from "../../components/layout/PageHeader";
import ConfirmModal from "../../components/modal/ConfirmModal";
import paginationStyles from "../../components/common/Pagination.module.css";
import styles from "./AdminNoticeDetailPage.module.css";

function formatDate(value) {
  return value ? value.slice(0, 10).replaceAll("-", ".") : "-";
}

function NoticeNavigation({ previousNotice, nextNotice }) {
  const navigate = useNavigate();

  return (
    <div className={`${paginationStyles.pagination} ${styles.noticePagination}`}>
      <Button
        kind="pagination"
        size="small"
        color="Neutral"
        status="Default"
        text="< 이전 공지"
        aria-label="이전 공지"
        disabled={!previousNotice}
        onClick={() => navigate(`/admin/notices/${previousNotice.noticeId}`)}
      />
      <Button
        kind="pagination"
        size="small"
        color="Neutral"
        status="Default"
        text="목록 페이지로"
        onClick={() => navigate("/admin/notices")}
      />
      <Button
        kind="pagination"
        size="small"
        color="Neutral"
        status="Default"
        text="다음 공지 >"
        aria-label="다음 공지"
        disabled={!nextNotice}
        onClick={() => navigate(`/admin/notices/${nextNotice.noticeId}`)}
      />
    </div>
  );
}

function AdminNoticeDetailPage() {
  const navigate = useNavigate();
  const { noticeId } = useParams();
  const queryClient = useQueryClient();
  const importantGuardRef = useRef(false);
  const deleteGuardRef = useRef(false);
  const downloadAllGuardRef = useRef(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const noticeQuery = useQuery({
    queryKey: noticeKeys.detail(noticeId),
    queryFn: ({ signal }) => fetchNoticeDetail(noticeId, { signal }),
  });
  const noticeData = noticeQuery.data;

  const importantMutation = useMutation({
    mutationFn: (nextImportant) =>
      updateNotice(noticeId, {
        title: noticeData.title,
        content: noticeData.content,
        important: nextImportant,
      }),
    onSuccess: (updatedNotice) => {
      queryClient.setQueryData(noticeKeys.detail(noticeId), updatedNotice);
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNotice(noticeId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: noticeKeys.detail(noticeId) });
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      navigate("/admin/notices", { replace: true });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (attachment) =>
      downloadNoticeAttachment(noticeId, attachment),
    onMutate: () => setDownloadError(""),
    onError: (error) => {
      setDownloadError(error?.message || "첨부파일을 다운로드하지 못했습니다.");
    },
  });

  function handleToggleImportant(nextImportant) {
    if (
      importantMutation.isPending ||
      importantGuardRef.current ||
      deleteMutation.isPending ||
      deleteGuardRef.current
    ) {
      return;
    }

    importantGuardRef.current = true;
    importantMutation.mutate(nextImportant, {
      onSettled: () => {
        importantGuardRef.current = false;
      },
    });
  }

  async function handleDownloadAll() {
    if (!noticeData || downloadAllGuardRef.current) {
      return;
    }

    downloadAllGuardRef.current = true;
    setDownloadError("");

    try {
      const results = await Promise.allSettled(
        noticeData.attachments.map((attachment) =>
          downloadNoticeAttachment(noticeId, attachment),
        ),
      );

      if (results.some((result) => result.status === "rejected")) {
        setDownloadError("일부 첨부파일을 다운로드하지 못했습니다.");
      }
    } finally {
      downloadAllGuardRef.current = false;
    }
  }

  function handleCloseDeleteModal() {
    if (!deleteMutation.isPending) {
      setIsDeleteModalOpen(false);
      deleteMutation.reset();
    }
  }

  function handleDelete() {
    if (
      importantMutation.isPending ||
      importantGuardRef.current ||
      deleteMutation.isPending ||
      deleteGuardRef.current
    ) {
      return;
    }

    deleteGuardRef.current = true;
    deleteMutation.mutate(undefined, {
      onSettled: () => {
        deleteGuardRef.current = false;
      },
    });
  }

  if (noticeQuery.isPending) {
    return (
      <div className={styles.noticeDetailPage}>
        <PageHeader />
        <div className={styles.stateMessage}>공지사항을 불러오는 중입니다.</div>
      </div>
    );
  }

  if (noticeQuery.isError || !noticeData) {
    return (
      <div className={styles.noticeDetailPage}>
        <PageHeader />
        <div className={styles.stateMessage} role="alert">
          <p>{noticeQuery.error?.message || "공지사항을 불러오지 못했습니다."}</p>
          <Button
            color="Primary"
            kind="border"
            size="Default"
            status="Default"
            text="다시 시도"
            onClick={() => noticeQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.noticeDetailPage}>
      <div className={styles.toolsCon}>
        <ToggleButton
          text="중요 공지 설정"
          status={noticeData.important}
          disabled={importantMutation.isPending || deleteMutation.isPending}
          onChange={handleToggleImportant}
        />
        <div className={styles.btnWrap}>
          <Button
            color="Primary"
            kind="border"
            showLeftIcon
            size="Default"
            status="Default"
            text="공지 수정"
            disabled={importantMutation.isPending || deleteMutation.isPending}
            onClick={() => navigate(`/admin/notices/edit/${noticeData.noticeId}`)}
          />
          <Button
            color="Danger"
            kind="border"
            showLeftIcon
            size="Default"
            status="Default"
            text="공지 삭제"
            disabled={importantMutation.isPending || deleteMutation.isPending}
            onClick={() => setIsDeleteModalOpen(true)}
          />
        </div>
      </div>

      {importantMutation.error ? (
        <p className={styles.errorMessage} role="alert">
          {importantMutation.error.message || "중요 공지 설정을 변경하지 못했습니다."}
        </p>
      ) : null}

      <PageHeader customTitle={noticeData.title} />

      <div className={styles.noticeDetail}>
        <div className={styles.noticeMetaCon}>
          <div className={styles.noticeMetaItem}>
            <span>작성자</span>
            <span>{noticeData.authorName || noticeData.authorId || "-"}</span>
          </div>
          <div className={styles.noticeMetaItem}>
            <span>작성일</span>
            <span>{formatDate(noticeData.createdAt)}</span>
          </div>
          <div className={styles.noticeMetaItem}>
            <span>조회수</span>
            <span>{noticeData.viewCount ?? "-"}</span>
          </div>
        </div>

        {noticeData.attachments.length > 0 ? (
          <div
            className={styles.noticeAttachmentsAccordion}
            data-open={isAccordionOpen}
          >
            <div className={styles.attachmentsSummary}>
              <button
                type="button"
                className={styles.accordionTriggerBtn}
                onClick={() => setIsAccordionOpen((current) => !current)}
              >
                <div className={styles.attachmentsIcon} />
                <span>첨부파일 {noticeData.attachments.length}개</span>
              </button>
              <IconTextButton
                text="모두 저장"
                icon="download"
                border={false}
                onClick={handleDownloadAll}
              />
            </div>

            <div className={styles.attachmentsCon}>
              <div className={styles.attachmentsWrap}>
                {noticeData.attachments.map((attachment) => (
                  <AttachmentItem
                    key={attachment.attachmentId}
                    attachment={attachment}
                    disabled={
                      downloadMutation.isPending &&
                      downloadMutation.variables?.attachmentId ===
                        attachment.attachmentId
                    }
                    onClick={() => downloadMutation.mutate(attachment)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {downloadError ? (
          <p className={styles.errorMessage} role="alert">
            {downloadError}
          </p>
        ) : null}

        <div className={styles.noticeContentCon}>
          <p className={styles.noticeContentWrap}>{noticeData.content}</p>
        </div>
      </div>

      <div className={styles.PagenationCon}>
        <NoticeNavigation
          previousNotice={noticeData.previousNotice}
          nextNotice={noticeData.nextNotice}
        />
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        icon="warning"
        title="공지사항 삭제"
        description="삭제한 공지사항은 되돌릴 수 없습니다."
        secondaryDescription={
          deleteMutation.error
            ? deleteMutation.error.message || "공지사항을 삭제하지 못했습니다."
            : "이 공지사항을 삭제하시겠습니까?"
        }
        cancelText="취소"
        confirmText={deleteMutation.isPending ? "삭제 중" : "삭제"}
        confirmColor="Danger"
        actionsDisabled={deleteMutation.isPending}
        closeOnEscape={!deleteMutation.isPending}
        closeOnOverlay={!deleteMutation.isPending}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default AdminNoticeDetailPage;
