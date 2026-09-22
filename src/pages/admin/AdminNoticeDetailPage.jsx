import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import styles from "./AdminNoticeDetailPage.module.css";
import paginationStyles from "../../components/common/Pagination.module.css";

import PageHeader from "../../components/layout/PageHeader";
import AttachmentItem from "../../components/common/AttachmentItem";
import ToggleButton from "../../components/common/ToggleButton";
import { IconTextButton } from "../../components/common/IconButton";
import Button from "../../components/common/Button";


function NoticeNavigation({ previousNotice, nextNotice }) {
    // 현재 상세 공지 데이터에 이전/다음 공지 정보가 포함되지 않는 구조로, 
    // 이전공지, 다음공지 버튼이 작동하지 않음.

    const navigate = useNavigate();

    return (
        <div className={`${paginationStyles.pagination} ${styles.noticePagination}`}>
            <Button
                kind="pagination"
                size="small"
                color="Neutral"
                status="Default"
                text="< 이전 공지"
                aria-label="이전 공지"
                disabled={!previousNotice}
                onClick={() =>
                    navigate(`/admin/notices/${previousNotice.id}`)
                }
            />
            <Button
                kind="pagination"
                size="small"
                color="Neutral"
                status="Default"
                text='목록 페이지로'
                onClick={() => navigate("/admin/notices")}
            />
            <Button
                kind="pagination"
                size="small"
                color="Neutral"
                status="Default"
                text="다음 공지 >"
                aria-label="다음 공지"
                disabled={!nextNotice}
                onClick={() =>
                    navigate(`/admin/notices/${nextNotice.id}`)
                }
            />
        </div>
    );
}

function AdminNoticeDetailPage() {
    const navigate = useNavigate();
    const noticeData = useLoaderData();
    // console.log('noticeData', noticeData);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isImportant, setIsImportnat] = useState(noticeData.isImportant);
    const [viewCount, setViewCount] = useState(noticeData.viewCount);


    useEffect(() => {
        setViewCount((prev) => prev + 1);
    }, []);

    return (
        <div className={styles.noticeDetailPage}>

            <div className={styles.toolsCon}>
                <ToggleButton text="중요 공지 설정" status={isImportant} onChange={() => setIsImportnat((prev) => !prev)} />
                <div className={styles.btnWrap}>

                    <Button
                        color='Primary' kind='border' showLeftIcon={true} size='Default' status='Default'
                        text="공지 수정"
                        onClick={() => navigate(`/admin/notices/edit/${noticeData.noticeId}`)}
                    />
                    <Button color='Danger' kind='border' showLeftIcon={true} size='Default' status='Default' text="공지 삭제" />
                </div>
            </div>

            <PageHeader />

            <div className={styles.noticeDetail}>

                <div className={styles.noticeMetaCon}>
                    <div className={styles.noticeMetaItem}>
                        <span>작성자</span>
                        <span>{noticeData.authorId}</span>
                    </div>
                    <div className={styles.noticeMetaItem}>
                        <span>작성일</span>
                        <span>{noticeData.createdAt.slice(0, 10).replaceAll("-", ".")}</span>
                    </div>
                    <div className={styles.noticeMetaItem}>
                        <span>조회수</span>
                        <span>{viewCount}</span>
                    </div>
                </div>
                {noticeData.attachments.length === 0 ? '' : (
                    < div
                        className={styles.noticeAttachmentsAccordion}
                        data-open={isAccordionOpen}
                    >
                        <div
                            className={styles.attachmentsSummary}
                        >
                            <button
                                className={styles.accordionTriggerBtn}
                                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                            >
                                <div className={styles.attachmentsIcon}></div>
                                <span> 첨부파일 {noticeData.attachments.length}개</span>
                            </button>
                            <IconTextButton text='모두 저장' icon="download" border={false} />
                        </div>

                        <div className={styles.attachmentsCon}>
                            <div className={styles.attachmentsWrap}>
                                {noticeData.attachments.map((attachment) => (
                                    <AttachmentItem attachment={attachment} />
                                ))}
                            </div>
                        </div>
                    </div >)}

                <div className={styles.noticeContentCon}>
                    <p className={styles.noticeContentWrap}>
                        {noticeData.content}
                    </p>
                </div>
            </div>

            <div className={styles.PagenationCon}>
                <NoticeNavigation
                    previousNotice={noticeData.previousNotice}
                    nextNotice={noticeData.nextNotice}
                />
            </div>
        </div >
    );
}

export default AdminNoticeDetailPage;