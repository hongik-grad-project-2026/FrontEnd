import StatusBadge from "../common/StatusBadge";

import styles from "./MemberInfoCard.module.css";

function EditButton({ label, onClick, disabledReason }) {
  return (
    <button
      type="button"
      className={styles.editButton}
      disabled={!onClick}
      aria-label={`${label} 수정`}
      title={onClick ? `${label} 수정` : disabledReason || "실제 수정 기능 미연결"}
      onClick={onClick}
    >
      <img src="/icons/icon16/edit.png" alt="" aria-hidden="true" />
      <span>수정</span>
    </button>
  );
}

function InfoField({ label, value, onEdit, editDisabledReason }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>

      <div className={styles.valueRow}>
        <strong className={styles.value} title={value}>
          {value || "-"}
        </strong>

        {onEdit !== undefined || editDisabledReason ? (
          <EditButton label={label} onClick={onEdit} disabledReason={editDisabledReason} />
        ) : null}
      </div>
    </div>
  );
}

function MemberInfoCard({
  member,
  badgeStatus,
  statusLabel,
  onEditMember,
  onEditPhone,
  onEditEmail,
  editDisabledReason,
  statusActionLabel,
  statusActionPending = false,
  onStatusAction,
  statusActionDisabledReason,
}) {
  return (
    <article className={styles.card} aria-label={`${member.name} 기본 정보`}>
      <div className={styles.profileWrap} aria-hidden="true">
        <img
          className={styles.profileImage}
          src={member.profileImageSrc}
          alt=""
          width={107}
          height={107}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.headingRow}>
          <h3 className={styles.name}>{member.name}</h3>

          {badgeStatus ? <StatusBadge text={badgeStatus.label} color={badgeStatus.color} size="lg" /> : null}
          {statusLabel ? <span className={styles.statusLabel}>{statusLabel}</span> : null}

          <EditButton label="회원 기본 정보" onClick={onEditMember} disabledReason={editDisabledReason} />

          {statusActionLabel ? (
            <button
              type="button"
              className={styles.statusActionButton}
              disabled={statusActionPending || !onStatusAction}
              title={!onStatusAction ? statusActionDisabledReason : undefined}
              onClick={onStatusAction}
            >
              {statusActionPending ? "처리 중..." : statusActionLabel}
            </button>
          ) : null}
        </div>

        <div className={styles.detailsGrid}>
          <InfoField label="단과대" value={member.college} />
          <InfoField label="학과" value={member.department} />
          <InfoField label="연락처" value={member.phone} onEdit={onEditPhone} editDisabledReason={editDisabledReason} />
          <InfoField label="학번" value={member.studentId} />
          <InfoField label="이메일" value={member.email} onEdit={onEditEmail} editDisabledReason={editDisabledReason} />
        </div>
      </div>
    </article>
  );
}

export default MemberInfoCard;
