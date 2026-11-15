import styles from './RankBarCard.module.css';

function RankBarCard({
    title,
    items = [],
    unit = "",
    wide = false,
    emptyMessage = "표시할 순위 데이터가 없습니다.",
}) {
    const maxValue = items.reduce((maximum, item) => {
        const value = Number(item.value);
        return Number.isFinite(value) ? Math.max(maximum, value) : maximum;
    }, 0);

    return (
        <article className={styles.card} data-wide={wide || undefined}>
            <h3 className={styles.title}>{title}</h3>
            {items.length > 0 ? (
                <ol className={styles.list}>
                    {items.map((item, index) => {
                        const value = Number(item.value);
                        const ratio = maxValue > 0 && Number.isFinite(value)
                            ? Math.max(0, value) / maxValue * 100
                            : 0;

                        return (
                            <li className={styles.row} key={`${item.label}-${index}`}>
                                <div
                                    className={styles.barTrack}
                                    role="img"
                                    aria-label={`${index + 1}위 ${item.label}, ${item.value}${unit}`}
                                >
                                    <span
                                        className={styles.barFill}
                                        data-rank={Math.min(index + 1, 3)}
                                        style={{ width: `${ratio}%` }}
                                        aria-hidden="true"
                                    />
                                    <span className={styles.label} title={item.label} aria-hidden="true">
                                        {index + 1}. {item.label}
                                    </span>
                                    <strong className={styles.value} aria-hidden="true">
                                        {item.value}{unit}
                                    </strong>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            ) : (
                <p className={styles.emptyState}>{emptyMessage}</p>
            )}
        </article>
    );
}

export default RankBarCard;