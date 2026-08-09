import styles from './Button.module.css'


// ===== icon button=====

function IconButtonBorder({ icon = 'back', size = '24', onClick }) {
    // size: 24 or 32
    return (
        <button
            onClick={onClick}
            className={`${styles.IconButtonBorder} ${styles[`IconButtonBorder${size}`]}`}
        >
            <img src={`/icons/icon16/${icon}.png`} alt="아이콘" />
        </button>
    );
}


function IconTextButton({ icon, text, onClick }) {
    // size: only 16
    return (
        <button
            onClick={onClick}
            className={styles.IconButtonBookmark}
        >
            <img src={`/icons/icon16/${icon}.png`} alt="아이콘" />
            <span>{text}</span>
        </button>
    )
}

// --------- 미완성 --------
function IconButtonPlain({ icon, onClick }) {
    // size: only 32
    return (
        <button
            onClick={onClick}
            className={`${styles.IconButtonPlain} `}
        >
            <img src={`/icons/icon24/${icon}.png`} alt="" />
        </button>
    )
}

function IconButtonBookmark({ onClick }) {
    // size: only 36, icon: only bookmark series
    return (
        <button
            onClick={onClick}
            className={styles.IconButtonBookmark}
        >
            <img src={``} alt="" />
        </button>
    )
}





// ===== text button=====
// 추가예정

export { IconButtonBorder, IconTextButton };