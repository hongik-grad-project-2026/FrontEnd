import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { fetchNotices, noticeKeys } from "../../api/noticeApi";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";
import Icon16Attachment from "../../../public/icons/icon16/paperclip.png";
import styles from "./StudentNoticeListPage.module.css";

const PAGE_SIZE = 10;
const IMPORTANT_FILTER = null;

function formatDate(value) {
  return value ? value.slice(0, 10).replace(/-/g, ".") : "-";
}

function NoticeTitleCell({ notice }) {
  return (
    <div className={styles.titleCell}>
      {notice.important ? (
        <span className={styles.important}>중요공지</span>
      ) : null}
      <p className={styles.title}>
        <span>{notice.title}</span>
      </p>
    </div>
  );
}

function StudentNoticeListPage() {
  const navigate = useNavigate();
  const [screenPage, setScreenPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const serverPage = screenPage - 1;
  const keyword = searchTerm.trim();

  const noticeQuery = useQuery({
    queryKey: noticeKeys.list({
      important: IMPORTANT_FILTER,
      keyword,
      page: serverPage,
      size: PAGE_SIZE,
    }),
    queryFn: ({ signal }) =>
      fetchNotices({
        important: IMPORTANT_FILTER,
        keyword,
        page: serverPage,
        size: PAGE_SIZE,
        signal,
      }),
  });

  const notices = noticeQuery.data?.content ?? [];

  const columns = [
    {
      key: "number",
      header: "번호",
      width: 76,
      align: "center",
      getValue: (notice) => notice.noticeId,
    },
    {
      key: "title",
      header: "제목",
      render: (notice) => <NoticeTitleCell notice={notice} />,
    },
    {
      key: "hasAttachment",
      header: "첨부파일",
      width: 60,
      align: "center",
      render: (notice) =>
        notice.hasAttachment === true ? (
          <img src={Icon16Attachment} alt="첨부파일" />
        ) : null,
    },
    {
      key: "viewCount",
      header: "조회수",
      align: "center",
      width: 64,
      getValue: (notice) => notice.viewCount ?? "-",
    },
    {
      key: "createdAt",
      header: "등록일",
      width: 96,
      align: "center",
      getValue: (notice) => formatDate(notice.createdAt),
    },
  ];

  const emptyMessage = noticeQuery.isPending
    ? "공지사항을 불러오는 중입니다."
    : noticeQuery.isError
      ? noticeQuery.error?.message || "공지사항을 불러오지 못했습니다."
      : keyword
        ? "검색 결과가 없습니다."
        : "등록된 공지사항이 없습니다.";

  return (
    <div className={styles.noticeListPage}>
      <PageHeader customTitle="공지사항" />
      <div>
        <DataTable
          ariaLabel="공지사항 목록 표"
          search={
            <SearchBar
              placeholder="제목·본문 검색"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setScreenPage(1);
              }}
              onSubmit={(nextSearchTerm) => {
                setSearchTerm(nextSearchTerm);
                setScreenPage(1);
              }}
            />
          }
          pagination={
            <Pagination
              page={screenPage}
              ariaLabel="공지사항 목록 페이지 이동"
              onChange={setScreenPage}
              totalPages={Math.max(noticeQuery.data?.totalPages ?? 1, 1)}
            />
          }
          rows={notices}
          columns={columns}
          emptyMessage={emptyMessage}
          getRowId={(notice) => notice.noticeId}
          onRowClick={(notice) =>
            navigate(`/student/notices/${notice.noticeId}`)
          }
          className={styles.noticeDataTable}
        />
      </div>
    </div>
  );
}

export default StudentNoticeListPage;
