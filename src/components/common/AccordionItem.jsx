import { useNavigate } from "react-router-dom";
import styles from "./AccordionItem.module.css"


function AccordionItem({ noticeId, isImportant, title, hasAttachments, createdAt, content }) {
    const navigate = useNavigate();

    return (
        <div
            className={styles.accordionItem}
            key={noticeId}
            onClick={() =>
                navigate(`/admin/notices/${noticeId}`)
            }
        >
            <div className={styles.accordionHeader}>
                {isImportant ? <span className={styles.importantNotice}>중요공지</span> : ''}
                <span className={styles.title}>{title}</span>
                {hasAttachments ? <img className={styles.attachmentIcon} src="/icons/icon16/paperclip.png" alt="첨부파일 아이콘" /> : ''}
                <span className={styles.createdAt}>{createdAt}</span>
                <img src="/icons/icon24/down.png" alt="열고 닫기 아이콘" />
            </div>
            <div className={styles.content}>
                <div className={styles.contentInner}>
                    {content}
                </div>
            </div>
        </div>
    );
}

export default AccordionItem;