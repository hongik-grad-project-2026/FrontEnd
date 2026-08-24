import Button from "./Button";
import styles from "./Pagination.module.css";

function createPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}

function Pagination({
  ariaLabel = "페이지 이동",
  className = "",
  onChange,
  page = 1,
  totalPages = 1,
}) {
  const resolvedTotalPages = Math.max(1, totalPages);

  const resolvedPage = Math.min(Math.max(1, page), resolvedTotalPages);

  const pageItems = createPageItems(resolvedPage, resolvedTotalPages);

  const moveToPage = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > resolvedTotalPages ||
      nextPage === resolvedPage
    ) {
      return;
    }

    onChange?.(nextPage);
  };

  const paginationClassName = [styles.pagination, className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={paginationClassName} aria-label={ariaLabel}>
      <Button
        kind="pagination"
        size="small"
        color="Neutral"
        status="Default"
        text="Prev"
        disabled={resolvedPage === 1}
        aria-label="이전 페이지"
        onClick={() => moveToPage(resolvedPage - 1)}
      />

      <div className={styles.pageNumbers}>
        {pageItems.map((item) => {
          if (typeof item === "string") {
            return (
              <span key={item} className={styles.ellipsis} aria-hidden="true">
                ...
              </span>
            );
          }

          const isActive = item === resolvedPage;

          return (
            <Button
              key={item}
              kind="pagination"
              size="small"
              color="Neutral"
              status={isActive ? "Active" : "Default"}
              text={String(item)}
              aria-label={`${item}페이지`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => moveToPage(item)}
            />
          );
        })}
      </div>

      <Button
        kind="pagination"
        size="small"
        color="Neutral"
        status="Default"
        text="Next"
        disabled={resolvedPage === resolvedTotalPages}
        aria-label="다음 페이지"
        onClick={() => moveToPage(resolvedPage + 1)}
      />
    </nav>
  );
}

export default Pagination;
