import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAdminRentalDashboard, rentalKeys } from '../../api/rentalApi';
import { isMockMode } from "../../api/client";
import { fetchNotices, noticeKeys } from '../../api/noticeApi';
import IconButton, { IconTextButton } from "../../components/common/IconButton";
import styles from "./AdminDashboardPage.module.css";
import PageHeader from "../../components/layout/PageHeader";
import AccordionItem from "../../components/common/AccordionItem";
import DashboardStatusCard from "../../components/card/DashboardStatusCard";
import RankBarCard from "../../components/card/RankBarCard";

const MOCK_RANK_CARDS = [
    {
        title: "노트북",
        unit: "%",
        maxValue: 100,
        items: [
            { label: "맥북 프로 16 M3", value: 85 },
            { label: "LG 그램 15.6", value: 66 },
            { label: "맥북 에어 13 M3 ", value: 33 },
        ],
    },
    {
        title: "태블릿",
        unit: "%",
        maxValue: 100,
        items: [
            { label: "갤럭시탭 S8", value: 85 },
            { label: "아이패드 11", value: 66 },
            { label: "갤럭시탭 A9", value: 33 },
        ],
    },
    {
        title: "장기 미대여",
        unit: "일",
        items: [
            { label: "삼성전자 보조배터리", value: 99 },
            { label: "모닝글로리 독서대", value: 88 },
            { label: "갤럭시탭 S7", value: 28 },
        ],
    },
];


function NoticeArea() {

    const {
        data,
        isLoading,
        isError,
        isFetching,
        error,
        refetch,
    } = useQuery({
        queryKey: noticeKeys.list({ important: null, page: 0, size: 5 }),
        queryFn: () =>
            fetchNotices({
                page: 0,
                size: 5,
            }),
    });

    const notices = data?.content ?? [];

    if (isLoading) {
        return <p className={styles.noticeState}>공지사항을 불러오는 중입니다.</p>;
    }

    if (isError) {
        return (
            <div className={styles.noticeState} role="alert">
                <p>{error?.message || "공지사항을 불러오지 못했습니다."}</p>
                <IconTextButton
                    icon="rotate"
                    text={isFetching ? "다시 시도 중" : "다시 시도"}
                    disabled={isFetching}
                    onClick={() => refetch()}
                />
            </div>
        );
    }

    if (notices.length === 0) {
        return <p className={styles.noticeState}>등록된 공지사항이 없습니다.</p>;
    }

    return (
        <div>
            {notices.map((notice) => {
                const hasAttachments = notice.hasAttachment ? true : false;
                const formattedDate = notice.createdAt
                    ? notice.createdAt.split("T")[0].replace(/-/g, ".")
                    : "-";

                return (<AccordionItem
                    key={notice.noticeId}
                    noticeId={notice.noticeId}
                    detailPath={`/admin/notices/${notice.noticeId}`}
                    isImportant={notice.important}
                    title={notice.title}
                    hasAttachments={hasAttachments}
                    createdAt={formattedDate}
                    content={notice.summary}
                />)
            })}

        </div>
    );
}



function AdminDashboardPage() {
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const navigate = useNavigate();

    const pad = (value) => String(value).padStart(2, "0");
    const formattedCurrentTime = `${currentTime.getFullYear()}년 ${pad(currentTime.getMonth() + 1)}월 ${pad(currentTime.getDate())}일, ${pad(currentTime.getHours())}:${pad(currentTime.getMinutes())}:${pad(currentTime.getSeconds())}`;
    const today = `${currentTime.getFullYear()}.${pad(currentTime.getMonth() + 1)}.${pad(currentTime.getDate())}`;


    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: [...rentalKeys.adminDashboard(), today],
        queryFn: ({ signal }) => getAdminRentalDashboard({ signal, today }),
        staleTime: 1000 * 60 * 5, // 데이터를 5분 동안 Fresh 상태로 유지함.
    });

    const initialCounts = {
        waitingApproval: 0,
        todayPickup: 0,
        todayReturn: 0,
        overdue: 0,
    };

    const rentalCounts = data ?? initialCounts;
    const rankCards = MOCK_RANK_CARDS.map((card) => ({
        ...card,
        items: isMockMode ? card.items : [],
    }));

    return (
        <main className={styles.dashboardPage}>
            <PageHeader />
            <section className={styles.section} >
                <div className={styles.sectionHead}>
                    <h3>공지사항</h3>
                    <IconTextButton
                        icon={'logout'}
                        size={32}
                        text={'전체 공지사항'}
                        onClick={() => navigate("/admin/notices")}
                    />
                </div>
                <div className={styles.contentArea}>
                    <NoticeArea />
                </div>
            </section>


            <section className={styles.section} >
                <h3>대여 현황 </h3>
                <div className={styles.contentArea} data-title='rentalStatusContent'>
                    {isLoading ? <p>대여 현황을 불러오는 중입니다.</p> : null}
                    {isError ? <p role="alert">{error?.message || "대여 현황을 불러오지 못했습니다."}</p> : null}
                    <div className={styles.curtimeContainer}>
                        <IconButton
                            icon={'rotate'}
                            ariaLabel="현재 시간 새로고침"
                            onClick={() => {
                                setCurrentTime(new Date());
                                refetch();
                            }}
                        />
                        <p>{formattedCurrentTime}</p>
                    </div>
                    {!isLoading && !isError ? <div className={styles.BoxesContainer}>
                        <DashboardStatusCard title={'승인 대기'} count={rentalCounts.waitingApproval} onClick={() => navigate("/admin/approval")} color='yellow' />
                        <DashboardStatusCard title={'오늘 수령'} count={rentalCounts.todayPickup} onClick={() => navigate("/admin/status")} color='green' />
                        <DashboardStatusCard title={'오늘 반납'} count={rentalCounts.todayReturn} onClick={() => navigate("/admin/status")} color='green' />
                        <DashboardStatusCard title={'연체'} count={rentalCounts.overdue} onClick={() => navigate("/admin/status")} color='red' />
                    </div> : null}
                </div>
            </section>

            <section className={styles.section}>
                <h3>모델별 가동률 현황 </h3>
                <div className={styles.contentArea} data-title='categoryStatusSection'>
                    {rankCards.map((card) => (
                        <RankBarCard key={card.title} {...card} />
                    ))}
                </div>
            </section>
        </main>
    );
}

export default AdminDashboardPage;
