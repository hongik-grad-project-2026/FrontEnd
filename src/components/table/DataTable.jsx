// AdminRentalApprovalPage 해당 표
import Checkbox from "../common/Checkbox";
import styles from "./DataTable.module.css";

function getDefaultRowId(row, index) {
  return row.id ?? index;
}

function getDefaultRowLabel(_row, index) {
  return `${index + 1}번째 행`;
}

function getColumnValue(column, row, rowIndex) {
  if (column.render) {
    return column.render(row, rowIndex);
  }

  if (column.getValue) {
    return column.getValue(row, rowIndex);
  }

  return row[column.key];
}

function getCellClassName(baseClassName, column) {
  return [
    baseClassName,
    column.align === "center" ? styles.centerCell : "",
    column.align === "right" ? styles.rightCell : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function isInteractiveTarget(target) {
  return Boolean(
    target?.closest?.(
      "a, button, input, select, textarea, [role='button'], [role='link']",
    ),
  );
}

function DataTable({
  allowHeaderOverflow = false,
  ariaLabel = "데이터 표",
  bulkAction,
  className = "",
  columns = [],
  emptyMessage = "표시할 데이터가 없습니다.",
  getRowId = getDefaultRowId,
  getRowLabel = getDefaultRowLabel,
  minWidth = 1120,
  onSelectedRowIdsChange,
  pagination,
  rows = [],
  search,
  selectedRowIds = [],
  totalCount,
  onRowClick,
}) {
  const selectable = typeof onSelectedRowIdsChange === "function";
  const clickable = typeof onRowClick === "function";

  const selectedRowIdSet = new Set(selectedRowIds);

  const visibleRowIds = rows.map((row, index) => getRowId(row, index));

  const selectedVisibleCount = visibleRowIds.filter((rowId) =>
    selectedRowIdSet.has(rowId),
  ).length;

  const allVisibleRowsSelected =
    rows.length > 0 && selectedVisibleCount === visibleRowIds.length;

  const someVisibleRowsSelected =
    selectedVisibleCount > 0 && !allVisibleRowsSelected;

  const resolvedTotalCount = totalCount ?? rows.length;

  const resolvedMinWidth =
    typeof minWidth === "number" ? `${minWidth}px` : minWidth;

  const rootClassName = [styles.dataTableRoot, className]
    .filter(Boolean)
    .join(" ");

  const updateVisibleRows = (checked) => {
    const visibleRowIdSet = new Set(visibleRowIds);

    if (checked) {
      onSelectedRowIdsChange?.([
        ...new Set([...selectedRowIds, ...visibleRowIds]),
      ]);

      return;
    }

    onSelectedRowIdsChange?.(
      selectedRowIds.filter((rowId) => !visibleRowIdSet.has(rowId)),
    );
  };

  const updateRow = (rowId, checked) => {
    if (checked) {
      onSelectedRowIdsChange?.([...new Set([...selectedRowIds, rowId])]);

      return;
    }

    onSelectedRowIdsChange?.(
      selectedRowIds.filter((selectedRowId) => selectedRowId !== rowId),
    );
  };

  const handleRowClick = (event, row) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    onRowClick?.(row);
  };

  const handleRowKeyDown = (event, row) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onRowClick?.(row);
  };

  const showToolbar = selectable || bulkAction || search;

  const tableColumnCount = columns.length + (selectable ? 1 : 0);

  return (
    <section
      className={rootClassName}
      data-header-overflow={allowHeaderOverflow || undefined}
    >
      {showToolbar ? (
        <div className={styles.toolbar}>
          <div className={styles.toolbarStart}>
            {selectable ? (
              <div className={styles.selectionSummary} aria-live="polite">
                <span>선택</span>

                <strong className={styles.selectedCount}>
                  {selectedRowIds.length}
                </strong>

                <span>/</span>
                <span>전체</span>

                <strong className={styles.totalCount}>
                  {resolvedTotalCount}
                </strong>
              </div>
            ) : null}

            {bulkAction ? (
              <div className={styles.bulkAction}>{bulkAction}</div>
            ) : null}
          </div>

          {search ? <div className={styles.searchSlot}>{search}</div> : null}
        </div>
      ) : null}

      <div className={styles.tableViewport}>
        <div
          className={styles.tableFrame}
          style={{ minWidth: resolvedMinWidth }}
        >
          <table className={styles.table} aria-label={ariaLabel}>
            <colgroup>
              {selectable ? <col className={styles.selectionColumn} /> : null}

              {columns.map((column) => (
                <col
                  key={column.key}
                  style={{
                    width:
                      typeof column.width === "number"
                        ? `${column.width}px`
                        : column.width,
                  }}
                />
              ))}
            </colgroup>

            <thead>
              <tr className={styles.headerRow}>
                {selectable ? (
                  <th className={styles.selectionCell} scope="col">
                    <Checkbox
                      checked={allVisibleRowsSelected}
                      indeterminate={someVisibleRowsSelected}
                      disabled={rows.length === 0}
                      ariaLabel="현재 페이지 전체 선택"
                      onChange={(event) =>
                        updateVisibleRows(event.target.checked)
                      }
                    />
                  </th>
                ) : null}

                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={getCellClassName(styles.headerCell, column)}
                    scope="col"
                  >
                    <div className={styles.cellContent}>{column.header}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length > 0 ? (
                rows.map((row, rowIndex) => {
                  const rowId = getRowId(row, rowIndex);
                  const rowLabel = getRowLabel(row, rowIndex);
                  const isSelected = selectedRowIdSet.has(rowId);

                  return (
                    <tr
                      key={rowId}
                      className={styles.bodyRow}
                      data-selected={isSelected}
                      data-clickable={clickable || undefined}
                      tabIndex={clickable ? 0 : undefined}
                      aria-label={
                        clickable ? `${rowLabel} 상세 보기` : undefined
                      }
                      onClick={
                        clickable
                          ? (event) => handleRowClick(event, row)
                          : undefined
                      }
                      onKeyDown={
                        clickable
                          ? (event) => handleRowKeyDown(event, row)
                          : undefined
                      }
                    >
                      {selectable ? (
                        <td className={styles.selectionCell}>
                          <Checkbox
                            checked={isSelected}
                            ariaLabel={`${rowLabel} 선택`}
                            onChange={(event) =>
                              updateRow(rowId, event.target.checked)
                            }
                          />
                        </td>
                      ) : null}

                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={getCellClassName(styles.bodyCell, column)}
                        >
                          <div className={styles.cellContent}>
                            {getColumnValue(column, row, rowIndex)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className={styles.emptyState} colSpan={tableColumnCount}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination ? (
        <div className={styles.paginationSlot}>{pagination}</div>
      ) : null}
    </section>
  );
}

export default DataTable;
