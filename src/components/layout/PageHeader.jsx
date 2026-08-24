import { useMatches } from 'react-router-dom'

import styles from './PageHeader.module.css'

function PageHeader() {
    const matches = useMatches()
    const currentMatch = matches.at(-1)
    const title = currentMatch?.handle?.title ?? '제목 없음'

    return (
        <div className={styles.pageHeader}>
            {title}
        </div>
    );
}

export default PageHeader;