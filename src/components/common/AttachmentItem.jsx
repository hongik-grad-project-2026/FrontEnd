import styles from "./AttachmentItem.module.css";
import IconButton from "./IconButton";

function AttachmentItem({ attachment }) {
    return (
        <div className={styles.attachmentItem} key={attachment.attachmentId}>
            <span className={styles.fileName}>
                {attachment.originalFileName}
            </span>
            <span className={styles.fileSize}>
                {attachment.fileSize} B
            </span>
            <IconButton icon={'download'} />
        </div>
    );
}

export default AttachmentItem;