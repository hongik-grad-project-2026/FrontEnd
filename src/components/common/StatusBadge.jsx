import styles from "./StatusBadge.module.css";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function StatusBadge({ text, size = "md", color = "gray", border = false }) {

  const sizeClassName = size === "lg" ? styles["height24"] : styles["height20"];
  const borderClassName = border ? styles.border : "";
  const colorClassName = color ? styles[color] : "";

  return (
    <div
      className={joinClassNames(styles.badge, sizeClassName, borderClassName, colorClassName)}
    >
      <span>
        {text}
      </span>
    </div>
  );
}

export default StatusBadge;
