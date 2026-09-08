import { useState } from "react";

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

export default function ToggleButton({ text = 'ToggleButton', status = false }) {
    const [isActive, setIsActive] = useState(status);
    return (
        <button
            className={styles.toggleButton}
            type="button"
            data-active={isActive}
            onClick={() => setIsActive((prev) => !prev)}
        >

            <div className={styles.pinIcon}></div>
            <span className={styles.toggleText}>{text}</span>
            <Toggle isActive={isActive} />
        </button >
    );
}
