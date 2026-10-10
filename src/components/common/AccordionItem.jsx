import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { fetchNoticeDetail, noticeKeys } from "../../api/noticeApi";

import styles from "./AccordionItem.module.css";

function AccordionItem({
  content,
  createdAt,
  detailPath,
  hasAttachments,
  isImportant,
  noticeId,
  title,
}) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasInlineContent =
    typeof content === "string" ? content.trim().length > 0 : Boolean(content);
  const canLoadDetail = noticeId !== undefined && noticeId !== null;
  const canExpand = hasInlineContent || canLoadDetail;

  const detailQuery = useQuery({
    queryKey: noticeKeys.detail(noticeId ?? ""),
    queryFn: ({ signal }) => fetchNoticeDetail(noticeId, { signal }),
    enabled: isExpanded && !hasInlineContent && canLoadDetail,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const openDetail = () => {
    navigate(detailPath ?? `/admin/notices/${noticeId}`);
  };

  const handleKeyDown = (event) => {
    if (
      event.target !== event.currentTarget ||
      (event.key !== "Enter" && event.key !== " ")
    ) {
      return;
    }

    event.preventDefault();
    openDetail();
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsExpanded(false);
    }
  };

  const handleMouseLeave = (event) => {
    if (!event.currentTarget.contains(document.activeElement)) {
      setIsExpanded(false);
    }
  };

  const handleRetry = (event) => {
    event.stopPropagation();
    detailQuery.refetch();
  };

  let expandedContent = content;

  if (!hasInlineContent) {
    if (detailQuery.isPending || detailQuery.isFetching) {
      expandedContent = "공지 내용을 불러오는 중입니다.";
    } else if (detailQuery.isError) {
      expandedContent = (
        <span className={styles.contentStatus}>
          공지 내용을 불러오지 못했습니다.
          <button
            type="button"
            className={styles.retryButton}
            onClick={handleRetry}
          >
            다시 시도
          </button>
        </span>
      );
    } else {
      expandedContent =
        detailQuery.data?.content?.trim() || "표시할 내용이 없습니다.";
    }
  }

  return (
    <div
      className={styles.accordionItem}
      data-expandable={canExpand}
      data-expanded={canExpand && isExpanded}
      role="link"
      tabIndex={0}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsExpanded(true)}
      onBlur={handleBlur}
      onClick={openDetail}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.accordionHeader}>
        {isImportant ? (
          <span className={styles.importantNotice}>중요공지</span>
        ) : null}
        <span className={styles.title}>{title}</span>
        {hasAttachments ? (
          <img
            className={styles.attachmentIcon}
            src="/icons/icon16/paperclip.png"
            alt="첨부파일 아이콘"
          />
        ) : null}
        <span className={styles.createdAt}>{createdAt}</span>
        {canExpand ? <div className={styles.updownIcon} /> : null}
      </div>

      {canExpand ? (
        <div className={styles.content}>
          <div className={styles.contentInner}>{expandedContent}</div>
        </div>
      ) : null}
    </div>
  );
}

export default AccordionItem;
