import { useMatches } from 'react-router-dom'

import styles from './PageHeader.module.css'

function PageHeader({ customTitle }) {
    const matches = useMatches()
    const currentMatch = matches.at(-1)
    const titleConfig = currentMatch?.handle?.title
    const title = typeof titleConfig === 'function'
        ? titleConfig(currentMatch)
        : titleConfig ?? customTitle ?? '제목 없음'

    return (
        <h2 className={styles.pageHeader}>
            {title}
        </h2>
    );
}

export default PageHeader;