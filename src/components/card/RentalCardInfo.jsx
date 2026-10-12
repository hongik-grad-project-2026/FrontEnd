// AdminRentalStatusPage에서 사용하는 정보 컴포넌트임.
import styles from "./RentalCardInfo.module.css";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function RentalCardInfo({ category, equipmentName, rentalId, fields = [] }) {
  const rentalInfoFields = Array.isArray(fields) ? fields : [];
  const fieldGroups = [];

  for (let index = 0; index < rentalInfoFields.length; index += 2) {
    fieldGroups.push(rentalInfoFields.slice(index, index + 2));
  }

  return (
    <div className={styles.info}>
      <div className={styles.titleGroup}>
        <p className={styles.category}>{category}</p>

        <div className={styles.titleRow}>
          <p className={styles.equipmentName}>{equipmentName}</p>

          {rentalId !== undefined && rentalId !== null && rentalId !== "" ? (
            <span className={styles.rentalId}>({rentalId})</span>
          ) : null}
        </div>
      </div>

      <div className={styles.infoGroup}>
        {fieldGroups.map((fieldGroup, groupIndex) => (
          <div className={styles.fieldGroup} key={groupIndex}>
            {fieldGroup.map((field, fieldIndex) => (
              <div
                className={joinClassNames(
                  styles.field,
                  field.underlined ? styles.fieldUnderlined : "",
                  field.tone === "danger" ? styles.fieldDanger : "",
                )}
                key={field.id ?? `${field.label}-${fieldIndex}`}
              >
                <p className={styles.fieldLabel}>{field.label}</p>
                <p className={styles.fieldValue}>{field.value}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RentalCardInfo;
