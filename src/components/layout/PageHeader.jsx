import { useMatches } from "react-router-dom";

import styles from "./PageHeader.module.css";

function PageHeader({ customTitle }) {
  const matches = useMatches();

  const currentMatch = [...matches]
    .reverse()
    .find((match) => match.handle?.title);

  const titleConfig = currentMatch?.handle?.title;

  const title =
    customTitle ??
    (typeof titleConfig === "function"
      ? titleConfig(currentMatch)
      : (titleConfig ?? "제목 없음"));

  return <h2 className={styles.pageHeader}>{title}</h2>;
}

export default PageHeader;
