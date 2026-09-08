//AdminRentalApprovalPage 해당 표
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

function DataTable({
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

  const showToolbar = selectable || bulkAction || search;

  const tableColumnCount = columns.length + (selectable ? 1 : 0);

  return (
    <section className={rootClassName}>
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

                  const isSelected = selectedRowIdSet.has(rowId);

                  return (
                    <tr
                      key={rowId}
                      className={styles.bodyRow}
                      data-selected={isSelected}
                      onClick={() => onRowClick(row)}
                    >
                      {selectable ? (
                        <td className={styles.selectionCell}>
                          <Checkbox
                            checked={isSelected}
                            ariaLabel={`${getRowLabel(row, rowIndex)} 선택`}
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
