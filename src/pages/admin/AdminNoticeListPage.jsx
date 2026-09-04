import { useState } from "react";
import { useQuery, } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { fetchNotices } from "../../api/noticeApi";
import styles from "./AdminNoticeListPage.module.css"

import Icon16Attachment from "../../../public/icons/icon16/paperclip.png"
import PageHeader from "../../components/layout/PageHeader"
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import DataTable from "../../components/table/DataTable";


function NoticeTitleCell({ request }) {
    return (
        <div className={styles.titleCell}>
            {request.important ? <span className={styles.important}>중요공지</span> : ''}
            <p className={styles.title}><span>{request.title}</span></p>

        </div>
    )
}

function AdminNoticeListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["list-notices", page],
        queryFn: () =>
            fetchNotices({
                page: page,
            }),
    });

    const notices = data?.content ?? [];
    // console.log('****', data?.totalPages ?? 0);

    const columns = [
        {
            key: "number",
            header: "번호",
            width: 76,
            align: 'center',
            getValue: (request) => request.noticeId
        },
        {
            key: "title",
            header: "제목",
            render: (request) => <NoticeTitleCell request={request} />
        },
        {
            key: "hasAttachment",
            header: "첨부파일",
            width: 60,
            align: 'center',
            render: (request) => (request.hasAttachment && <img src={Icon16Attachment} alt={'첨부파일'} />),
        },
        {
            key: "viewCount",
            header: "조회수",
            align: 'center',
            width: 64,
        },
        {
            key: "createdAt",
            header: "등록일",
            width: 96,
            align: 'center',
            getValue: (request) => request.createdAt.slice(0, 10).replace(/-/g, ".")
        },
    ]

    return (
        <div className={styles.noticeListPage} >
            <PageHeader />
            <div className={styles.contentArea} >

                <DataTable
                    ariaLabel={'공지사항 목록 표'}
                    bulkAction={
                        <Button
                            kind={'fill'}
                            status={'Default'}
                            size={'Default'}
                            color={'Primary'}
                            text={'공지사항 작성'}
                        />
                    }
                    search={
                        <SearchBar
                            placeholder='제목으로 검색...'
                            width={400} />
                    }
                    pagination={
                        <Pagination
                            page={page + 1}
                            ariaLabel="공지사항 목록 페이지 이동"
                            onChange={(nextPage) => setPage(nextPage - 1)}
                            totalPages={data?.totalPages ?? 1}
                        />
                    }
                    rows={notices}// 현재 페이지에 보여줄 데이터 배열
                    columns={columns}// 열 정의 배열 
                    onRowClick={(row) => navigate(`/admin/notices/${row.noticeId}`)}// 행 클릭 시 상세 페이지로 이동
                    className={styles.noticeDataTable}
                />

            </div>
        </ div>
    );
}

export default AdminNoticeListPage;