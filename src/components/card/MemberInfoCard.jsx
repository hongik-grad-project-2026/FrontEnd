import StatusBadge from "../common/StatusBadge";

import styles from "./MemberInfoCard.module.css";

function EditButton({ label, onClick }) {
  return (
    <button
      type="button"
      className={styles.editButton}
      disabled={!onClick}
      aria-label={`${label} 수정`}
      title={onClick ? `${label} 수정` : "실제 수정 기능 미연결"}
      onClick={onClick}
    >
      <img src="/icons/icon16/edit.png" alt="" aria-hidden="true" />
      <span>수정</span>
    </button>
  );
}

function InfoField({ label, value, onEdit }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>

      <div className={styles.valueRow}>
        <strong className={styles.value} title={value}>
          {value || "-"}
        </strong>

        {onEdit !== undefined ? (
          <EditButton label={label} onClick={onEdit} />
        ) : null}
      </div>
    </div>
  );
}

function MemberInfoCard({
  member,
  badgeStatus,
  onEditMember,
  onEditPhone,
  onEditEmail,
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

          <StatusBadge status={badgeStatus} size="lg" />

          <EditButton label="회원 기본 정보" onClick={onEditMember} />
        </div>

        <div className={styles.detailsGrid}>
          <InfoField label="학과" value={member.department} />
          <InfoField label="연락처" value={member.phone} onEdit={onEditPhone} />
          <InfoField label="학번" value={member.studentId} />
          <InfoField label="이메일" value={member.email} onEdit={onEditEmail} />
        </div>
      </div>
    </article>
  );
}

export default MemberInfoCard;
