import { Link, useMatches, useNavigate } from "react-router-dom";
import IconButton from "../common/IconButton";
import styles from "./Breadcrumbs.module.css";

// useMatches()를 호출하면 현재 URL에 해당하는  최상위 부모부터 최하위 자식까지의 라우트 정보가 배열로 들어옴
function Breadcrumbs() {
  const navigate = useNavigate();
  const matches = useMatches();

  console.log("Breadcrumbs-----matches", matches);

  // handle.title이 존재하는 라우트만 뽑아내기
  const crumbs = matches
    .filter((match) => match.handle?.title)
    .map((match) => {
      return {
        id: match.id,
        label: match.handle.title,
        to: match.pathname,
      };
    });

  return (
    <div className={styles.breadcrumbs}>
      <div className={styles.btnCon}>
        <IconButton icon="back--n50" size={24} onClick={() => navigate(-1)} />

        <IconButton icon="forward--n50" size={24} onClick={() => navigate(1)} />
      </div>

      <div className={styles.crumbsCon}>
        {crumbs.map((crumb, index) => {
          return (
            <div key={crumb.id} className={styles.crumbsItem}>
              <span
                className={
                  index === crumbs.length - 1 ? styles.currentPath : styles.path
                }
              >
                <Link to={crumb.to}>{crumb.label}</Link>
              </span>

              {index < crumbs.length - 1 ? <span>/</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Breadcrumbs;
