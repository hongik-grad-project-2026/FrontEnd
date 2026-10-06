import { useNavigate } from "react-router-dom";
import styles from "./AccordionItem.module.css"


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
    const hasContent = typeof content === "string"
        ? content.trim().length > 0
        : Boolean(content);

    return (
        <div
            className={styles.accordionItem}
            data-has-content={hasContent}
            onClick={() =>
                navigate(detailPath ?? `/admin/notices/${noticeId}`)
            }
        >
            <div className={styles.accordionHeader}>
                {isImportant ? <span className={styles.importantNotice}>중요공지</span> : ''}
                <span className={styles.title}>{title}</span>
                {hasAttachments ? <img className={styles.attachmentIcon} src="/icons/icon16/paperclip.png" alt="첨부파일 아이콘" /> : ''}
                <span className={styles.createdAt}>{createdAt}</span>
                {hasContent ? <div className={styles.updownIcon}></div> : null}
            </div>
            {hasContent ? (
                <div className={styles.content}>
                    <div className={styles.contentInner}>
                        {content}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default AccordionItem;
