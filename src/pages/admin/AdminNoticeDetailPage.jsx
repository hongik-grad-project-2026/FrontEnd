import { useLoaderData } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";

function AdminNoticeDetailPage() {
    const noticeData = useLoaderData();
    console.log('noticeData', noticeData);

    return (
        <div>
            <PageHeader />
            <span>{noticeData.title}</span>
            <span>{noticeData.authorId}</span>
            <span>{noticeData.createdAt}</span>
            <span>{noticeData.viewCount}</span>
            {noticeData.attachments.map((attachment) => {
                return (
                    <div key={attachment.attachmentId}>
                        <span>{attachment.originalFileName}</span>
                        <span>{attachment.fileSize} bytes</span>
                    </div>
                );
            })}
            <p>{noticeData.summary}</p>
            <p>{noticeData.content}</p>
        </div>
    );
}

export default AdminNoticeDetailPage;