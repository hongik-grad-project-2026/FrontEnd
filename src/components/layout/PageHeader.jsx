import { useMatches } from 'react-router-dom'

import styles from './PageHeader.module.css'

function PageHeader() {
    const matches = useMatches()
    const currentMatch = matches.at(-1)
    const title = currentMatch?.handle?.title ?? '제목 없음'

    return (
        <div className={styles.pageHeader}>
            {/* {title}ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ거ㅏㄴ다엉어어어ㅏ단아ㅏ다다다 */}
            {title} (페이지 제목이 길 경우에 줄바꿈 제목이 길 경우에 줄바꿈 제목이 길 경우에)
        </div>
    );
}

export default PageHeader;