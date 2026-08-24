import { useQuery } from "@tanstack/react-query";
import { MOCK_NOTICES, fetchNotices } from '../../api/noticeApi';
import { IconTextButton } from "../../components/common/IconButton";
import styles from "./AdminDashboardPage.module.css"
import PageHeader from "../../components/layout/PageHeader";
import AccordionItem from "../../components/common/AccordionItem";


function NoticeArea() {

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["latest-notices"],
        queryFn: () =>
            fetchNotices({
                page: 0,
                size: 5,
            }),
    });

    const notices = data?.content ?? [];
    console.log('notices >> ', notices);


    return (
        <div>
            {notices.map((notice) => {
                const hasAttachments = notice.attachments.length > 0 ? true : false;
                const formattedDate = notice.createdAt.split("T")[0].replace(/-/g, ".");

                return (<AccordionItem
                    key={notice.noticeId}
                    isImportant={notice.important}
                    title={notice.title}
                    hasAttachments={hasAttachments}
                    createdAt={formattedDate}
                    content={notice.content}
                />)
            })}

        </div>
    );
}

function AdminDashboardPage() {
    return (
        <div>
            <PageHeader />


            <h3>공지사항 </h3>
            <IconTextButton
                icon={'logout'}
                size={32}
                text={'전체 공지사항'}
            />
            <div className={styles.contentArea}>
                <NoticeArea />

            </div>
        </div>
    );
}

export default AdminDashboardPage;