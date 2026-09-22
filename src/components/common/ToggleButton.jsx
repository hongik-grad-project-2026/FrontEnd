import styles from "./ToggleButton.module.css";

function Toggle({ isActive }) {

    return (
        <div
            className={styles.togglePanel}
            data-active={isActive}
        >
            <div className={styles.toggleCircle}></div>
        </div>

    );
}

export default function ToggleButton({
    text = '중요 공지 설정',
    status = false,
    onChange }) {

    return (
        <button
            className={styles.toggleButton}
            type="button"
            data-active={status}
            onClick={() => onChange?.(!status)}
        >

            <div className={styles.pinIcon}></div>
            <span className={styles.toggleText}>{text}</span>
            <Toggle isActive={status} />
        </button >
    );
}
