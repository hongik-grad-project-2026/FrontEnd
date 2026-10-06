import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  downloadNoticeAttachment,
  fetchNoticeDetail,
  noticeKeys,
} from "../../api/noticeApi";
import AttachmentItem from "../../components/common/AttachmentItem";
import Button from "../../components/common/Button";
import { IconTextButton } from "../../components/common/IconButton";
import PageHeader from "../../components/layout/PageHeader";
import paginationStyles from "../../components/common/Pagination.module.css";
import styles from "./StudentNoticeDetailPage.module.css";

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
        onClick={() => navigate(`/student/notices/${previousNotice.noticeId}`)}
      />
      <Button
        kind="pagination"
        size="small"
        color="Neutral"
        status="Default"
        text="목록 페이지로"
        onClick={() => navigate("/student/notices")}
      />
      <Button
        kind="pagination"
        size="small"
        color="Neutral"
        status="Default"
        text="다음 공지 >"
        aria-label="다음 공지"
        disabled={!nextNotice}
        onClick={() => navigate(`/student/notices/${nextNotice.noticeId}`)}
      />
    </div>
  );
}

function StudentNoticeDetailPage() {
  const { noticeId } = useParams();
  const downloadAllGuardRef = useRef(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const noticeQuery = useQuery({
    queryKey: noticeKeys.detail(noticeId),
    queryFn: ({ signal }) => fetchNoticeDetail(noticeId, { signal }),
  });
  const noticeData = noticeQuery.data;
  const downloadMutation = useMutation({
    mutationFn: (attachment) =>
      downloadNoticeAttachment(noticeId, attachment),
    onMutate: () => setDownloadError(""),
    onError: (error) => {
      setDownloadError(error?.message || "첨부파일을 다운로드하지 못했습니다.");
    },
  });

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
      <div className={styles.headerCon}>
        {noticeData.important ? (
          <p className={styles.importantText}>중요공지</p>
        ) : null}
        <PageHeader customTitle={noticeData.title} />
      </div>

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
    </div>
  );
}

export default StudentNoticeDetailPage;
