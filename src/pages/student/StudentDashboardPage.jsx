import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchNotices } from '../../api/noticeApi';

import { getEquipmentList } from "../../api/equipmentApi"

import StatusBadge from "../../components/common/StatusBadge";
import EquipmentCard from "../../components/card/EquipmentCard"
import PageHeader from "../../components/layout/PageHeader"
import { IconTextButton } from "../../components/common/IconButton";
import AccordionItem from "../../components/common/AccordionItem";


import styles from "./StudentDashboardPage.module.css"

const mockRentalList = [
  { id: 1, status: "승인대기", modelName: "Sony A7 IV" },
  {
    id: 2,
    status: "승인대기",
    modelName: "Canon EOS R6 Mark II",
  },
  {
    id: 3,
    status: "승인대기",
    modelName: "Zoom H6 레코더",
  },
  {
    id: 4,
    status: "승인대기",
    modelName: "Zoom H6 레코더",
  },
  {
    id: 5,
    status: "수령대기",
    modelName: "FE 24-70mm F2.8",
    expectedPickupAt: "2026-09-20T14:00:00",
  },
  {
    id: 6,
    status: "수령대기",
    modelName: "무선 핀마이크",
    expectedPickupAt: "2026-09-21T10:30:00",
  },
  {
    id: 9,
    status: "대여중",
    modelName: "DJI RS 3 짐벌",
    expectedReturnAt: "2026-09-20",
    returnDday: 2,
  },

]


function formatPickupDateTime(dateTime) {
  const [date, time] = dateTime.split("T");
  return `${date.replaceAll("-", ".")} ${time}`;
}

function formatReturnDate(date) {
  return date.replaceAll("-", ".");
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


function RentalsLi({ rental }) {
  return (
    <li className={styles.rentalsLi} data-rantalStatus={rental.status}>
      <div >
        <span className={styles.liModelName}>{rental.modelName}</span>
      </div>
      {rental.status === "수령대기" && (
        <span className={styles.liDateInfo}>{formatPickupDateTime(rental.expectedPickupAt)}</span>
      )}
      {rental.status === "대여중" && (
        <span className={styles.liDateInfo}>
          {formatReturnDate(rental.expectedReturnAt)} (D-{rental.returnDday})
        </span>
      )}
    </li>
  );
}

function StudentDashboardPage() {
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState(() => getEquipmentList())
  const rentalGroups = {
    "승인대기": mockRentalList.filter((rental) => rental.status === "승인대기"),
    "수령대기": mockRentalList.filter((rental) => rental.status === "수령대기"),
    "대여중": mockRentalList.filter((rental) => rental.status === "대여중"),
  };

  function handleWishChange(equipmentId, nextIsWish) {
    setEquipmentList((currentList) =>
      currentList.map((equipment) =>
        equipment.id === equipmentId
          ? { ...equipment, isWish: nextIsWish }
          : equipment
      )
    )
  }

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
            onClick={() => navigate("/student/notices")}
          />
        </div>
        <div className={styles.contentArea}>
          <NoticeArea />
        </div>
      </section>

      <section className={styles.section} >
        <h3>대여 현황</h3>
        <div className={styles.rentalsGrid}>
          <div className={`${styles.contentArea} ${styles.rentalStatusBox}`}>
            <StatusBadge status='대여-승인대기' size='md' />
            <ul>
              {rentalGroups["승인대기"].slice(0, 2).map((rental) => (
                <RentalsLi key={rental.id} rental={rental} />
              ))}
              {rentalGroups["승인대기"].length > 2 ? <li className={styles.rentalsCount}><span>+{rentalGroups["승인대기"].length - 2}건</span></li> : ''}
            </ul>
          </div>
          <div className={`${styles.contentArea} ${styles.rentalStatusBox}`}>
            <StatusBadge status='대여-수령대기' size='md' />
            <ul>
              {rentalGroups["수령대기"].slice(0, 2).map((rental) => (
                <RentalsLi key={rental.id} rental={rental} />
              ))}
              {rentalGroups["수령대기"].length > 2 ? <li className={styles.rentalsCount}><span>+{rentalGroups["승인대기"].length - 2}건</span></li> : ''}
            </ul>

          </div>
          <div className={`${styles.contentArea} ${styles.rentalStatusBox}`}>
            <StatusBadge status='대여-대여중' size='md' />
            <ul>
              {rentalGroups["대여중"].slice(0, 2).map((rental) => (
                <RentalsLi key={rental.id} rental={rental} />
              ))}
              {rentalGroups["대여중"].length > 2 ? <li className={styles.rentalsCount}><span>+{rentalGroups["승인대기"].length - 2}건</span></li> : ''}
            </ul>

          </div>
        </div>

      </section>

      <section className={styles.section} >
        <h3>찜목록</h3>
        <div className={styles.wishListGrid}>
          {equipmentList.map((equipment) => (
            <EquipmentCard
              key={equipment.id}
              {...equipment}
              onWishChange={(nextIsWish) =>
                handleWishChange(equipment.id, nextIsWish)
              }
            />
          ))}
        </div>
      </section>

    </main>

  );
}

export default StudentDashboardPage;
