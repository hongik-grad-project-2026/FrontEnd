import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { IconTextButton } from "../common/IconButton";
import styles from "./Sidebar.module.css";


// ----- NavItem ----- //

function NavItem({
  itemName = "itemName",
  navLink = "/",
  icon = "dashboard",
  end = false,
  forceActive = false,
}) {
  return (
    <li>
      <NavLink
        end={end}
        to={navLink}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive || forceActive ? styles["navItem-active"] : ""}`
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

function AccountPanel({ userName, userRole, userId, profileImage, onLogout }) {
  return (
    <div className={styles.accountPanel} data-userrole={userRole}>
      <div className={styles.buttonCon}>
        <IconTextButton icon="notification" text="알림" border={false} />
        <IconTextButton icon="logout" text="로그아웃" border={false} onClick={onLogout} />
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
            {userId}
          </p>
        </div>
      </div>
    </div>
  );
}

// ----- Sidebar ----- //

function Sidebar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const userName = user.name;
  const userId = user.loginId || user.id;
  const accountMode = user.role;
  const profileImage = user.profileImageUrl;
  const isAdmin = accountMode === "admin";
  const isStudent = accountMode === "student";


  async function handleLogout() {
    await logout();
    // 뒤로가기로 로그인 이전 페이지에 돌아가지 못하게 해.
    navigate("/login", { replace: true });
  }

  if (!isAdmin && !isStudent) {
    return null;
  }

  const dashboardPath = isAdmin ? "/admin" : "/student";
  const isDashboardActive =
    location.pathname === dashboardPath ||
    location.pathname === `${dashboardPath}/` ||
    location.pathname.startsWith(`${dashboardPath}/notices`);

  return (
    <section className={styles.sidebar}>
      <h1 className={styles.logoArea}>
        <Link
          className={styles.logoLink}
          to={dashboardPath}
          aria-label="현재 역할 대시보드로 이동"
        >
          <img src="/images/h1.png" alt="홍익대학교" />
          <span>멀티미디어실</span>
        </Link>
      </h1>

      <div className={styles.navCon}>
        <NavSubtitle titleName="overview">
          <NavItem
            itemName="대시보드"
            navLink={dashboardPath}
            icon="dashboard"
            end
            forceActive={isDashboardActive}
          />
        </NavSubtitle>


        {isAdmin ? (
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
        onLogout={handleLogout}
      />
    </section>
  );
}

export default Sidebar;


