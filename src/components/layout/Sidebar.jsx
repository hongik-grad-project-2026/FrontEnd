import { NavLink } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { IconTextButton } from "../common/IconButton";
import styles from "./Sidebar.module.css";


// ----- NavItem ----- //

function NavItem({
  itemName = "itemName",
  navLink = "/",
  icon = "dashboard",
  end = false,
}) {
  return (
    <li>
      <NavLink
        end={end}
        to={navLink}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles["navItem-active"] : ""}`
        }
      >
        <span
          className={styles.navItemIcon}
          style={{
            "--nav-icon": `url(/icons/icon24/${icon}.png)`,
            "--nav-icon-hover": `url(/icons/icon24/${icon}--primary.png)`,
          }}
        />

        <span className={styles.itemName}>{itemName}</span>
      </NavLink>
    </li>
  );
}

// ----- NavSubtitle ----- //

function NavSubtitle({ titleName = "titleName", children }) {
  return (
    <div>
      <p className={styles.navSubtitle}>{titleName}</p>

      <ul className={styles.navList}>{children}</ul>
    </div>
  );
}

// ----- AccountPanel ----- //

function AccountPanel({ userName, userRole, userId, profileImage }) {
  return (
    <div className={styles.accountPanel} data-userRole={userRole}>
      <div className={styles.buttonCon}>
        <IconTextButton icon="notification" text="알림" border={false} />
        <IconTextButton icon="logout" text="로그아웃" border={false} />
      </div>

      <div className={styles.userinfoCon}>
        <div
          className={styles.profileimgCon}
          data-profile-image={Boolean(profileImage)}
        >
          {userRole === "admin" ? (
            <img src="/images/hongikLogo-circle.png" alt="" />
          ) : profileImage ? (
            <img src={profileImage} alt="프로필" />
          ) : null}
        </div>

        <div className={styles.profiletextCon}>
          <p className={styles.userName}>{userName}</p>

          <p className={styles.userInfo}>
            {userRole === "admin" ? "관리자 모드" : userId}
          </p>
        </div>
      </div>
    </div>
  );
}

// ----- Sidebar ----- //

function Sidebar() {
  // Context에서 사용자 정보 읽어옴
  const { user } = useUser();

  const userName = user.name;
  const userId = user.id;
  const accountMode = user.role;
  const profileImage = user.profile_image_url;

  return (
    <section className={styles.sidebar}>
      <h1 className={styles.logoArea}>
        <img src="/images/h1.png" alt="홍익대학교" />
        멀티미디어실
      </h1>

      <div className={styles.navCon}>
        <NavSubtitle titleName="overview">
          <NavItem
            itemName="대시보드"
            navLink={`/${accountMode}/`}
            icon="dashboard"
            end
          />
        </NavSubtitle>


        {user.role === 'admin' ? (
          <>
            <NavSubtitle titleName="Management">
              <NavItem
                itemName="대여신청 승인"
                navLink={`/${accountMode}/approval`}
                icon="approval"
              />

              <NavItem
                itemName="대여 현황"
                navLink={`/${accountMode}/status`}
                icon="status"
              />

              <NavItem
                itemName="기자재 관리"
                navLink={`/${accountMode}/equipment`}
                icon="equipment"
              />

              <NavItem
                itemName="대여 기록"
                navLink={`/${accountMode}/history`}
                icon="history"
              />
            </NavSubtitle>

            <NavSubtitle titleName="Account">
              <NavItem
                itemName="회원 관리"
                navLink={`/${accountMode}/members`}
                icon="members"
              />
            </NavSubtitle>
          </>
        ) : (
          <>
            <NavSubtitle titleName="Rental">

              <NavItem
                itemName="기자재 조회&신청"
                navLink={`/${accountMode}/equipment`}
                icon="equipment"
              />
              <NavItem
                itemName="내 대여 내역"
                navLink={`/${accountMode}/history`}
                icon="status"
              />
            </NavSubtitle>

            <NavSubtitle titleName="Account">
              <NavItem
                itemName="마이페이지"
                navLink={`/${accountMode}/mypage`}
                icon="user"
              />
            </NavSubtitle>
          </>
        )}

      </div>

      <AccountPanel
        userName={userName}
        userRole={accountMode}
        userId={userId}
        profileImage={profileImage}
      />
    </section>
  );
}

export default Sidebar;


