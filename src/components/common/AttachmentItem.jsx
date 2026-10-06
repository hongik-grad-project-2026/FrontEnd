import styles from "./AttachmentItem.module.css";
import IconButton from "./IconButton";

function formatFileSize(fileSize) {
  const bytes = Number(fileSize ?? 0);

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentItem({
  attachment,
  disabled = false,
  icon = "download",
  onClick,
}) {
  const originalFileName =
    attachment?.originalFileName ?? attachment?.name ?? "첨부파일";

  return (
    <div className={styles.attachmentItem}>
      <span className={styles.fileName} title={originalFileName}>
        {originalFileName}
      </span>
      <span className={styles.fileSize}>
        {formatFileSize(attachment?.fileSize ?? attachment?.size)}
      </span>
      <IconButton
        icon={icon}
        ariaLabel={icon === "trash" ? `${originalFileName} 선택 해제` : `${originalFileName} 다운로드`}
        disabled={disabled || !onClick}
        onClick={onClick}
      />
    </div>
  );
}

export default AttachmentItem;
