import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import { useUser } from "../../context/UserContext";
import styles from "./NotFoundPage.module.css";

const ROLE_HOME = {
  admin: "/admin",
  student: "/student",
};

function NotFoundPage() {
  const navigate = useNavigate();
  const { user, authStatus } = useUser();
  const isCheckingAuthentication = authStatus === "checking";
  const roleHomePath = ROLE_HOME[user?.role];
  const homePath = isCheckingAuthentication ? null : (roleHomePath ?? "/login");
  const homeLabel = isCheckingAuthentication
    ? "로그인 확인 중"
    : roleHomePath
      ? "대시보드로 이동"
      : "로그인으로 이동";

  function handleHomeNavigation() {
    if (!homePath) return;

    navigate(homePath, { replace: true });
  }

  return (
    <main className={styles.notFoundPage}>
      <section className={styles.content} aria-labelledby="not-found-title">
        <p className={styles.statusCode}>404</p>
        <h1 id="not-found-title" className={styles.title}>
          페이지를 찾을 수 없습니다.
        </h1>
        <p className={styles.description}>
          주소가 올바른지 확인하거나 이전 화면으로 이동해 주세요.
        </p>

        <div className={styles.actions}>
          <Button
            color="Neutral"
            kind="border"
            size="Default"
            status="Default"
            text="이전 화면"
            onClick={() => navigate(-1)}
          />
          <Button
            color="Primary"
            kind="fill"
            size="Default"
            status="Default"
            text={homeLabel}
            disabled={isCheckingAuthentication}
            onClick={handleHomeNavigation}
          />
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
