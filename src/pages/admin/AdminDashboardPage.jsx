import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { today, fetchRentals } from '../../api/rentalApi';
import { fetchNotices } from '../../api/noticeApi';
import IconButton, { IconTextButton } from "../../components/common/IconButton";
import styles from "./AdminDashboardPage.module.css";
import PageHeader from "../../components/layout/PageHeader";
import AccordionItem from "../../components/common/AccordionItem";

import InputBar from "../../components/common/Input";

function CurruntStateBox({ title, count, ...props }) {
  return (
    <div className={styles.curruntStateBox} data-title={title} {...props}>
      <p>{title}</p>
      <p>
        <span>{count}</span>건
      </p>
    </div>
  );
}

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

    return (
        <div>
            {notices.map((notice) => {
                const hasAttachments = notice.hasAttachment ? true : false;
                const formattedDate = notice.createdAt.split("T")[0].replace(/-/g, ".");

                return (<AccordionItem
                    noticeId={notice.noticeId}
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


    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['rentals', ['대여중', '승인대기', '수령대기']],
        queryFn: () => fetchRentals({
            statuses: ["대여중", "승인대기", "수령대기"],
        }),
        staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 Fresh 상태로 유지
    });

    const initialCounts = {
        waitingApproval: 0,
        todayPickup: 0,
        todayReturn: 0,
        overdue: 0,
    };

    const rentals = data ?? [];
    const rentalCounts = rentals.reduce((counts, rental) => {
        if (rental.status === "승인대기") {
            counts.waitingApproval += 1;
        }

        if (
            rental.status === "수령대기" &&
            rental.expectedPickupAt === today
        ) {
            counts.todayPickup += 1;
        }

        if (
            rental.status === "대여중" &&
            rental.expectedReturnAt === today
        ) {
            counts.todayReturn += 1;
        }

        if (
            rental.status === "대여중" &&
            rental.expectedReturnAt < today
        ) {
            counts.overdue += 1;
        }

        return counts;
    }, initialCounts);

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
                    <div className={styles.BoxesContainer}>
                        <CurruntStateBox title={'승인 대기'} count={rentalCounts.waitingApproval} onClick={() => navigate("/admin/approval")} />
                        <CurruntStateBox title={'오늘 수령'} count={rentalCounts.todayPickup} onClick={() => navigate("/admin/status")} />
                        <CurruntStateBox title={'오늘 반납'} count={rentalCounts.todayReturn} onClick={() => navigate("/admin/status")} />
                        <CurruntStateBox title={'연체'} count={rentalCounts.overdue} onClick={() => navigate("/admin/status")} />
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h3>카테고리별 현황 </h3>
                <div className={styles.contentArea} data-title='categoryStatusSection'>
                </div>
            </section>
        </main>
    );
}

export default AdminDashboardPage;
