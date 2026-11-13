import { type CSSProperties, type ReactNode, useId, useMemo } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import { nextSort, sortRows, type TableSort } from "../../foundations/sort.js";
import type { Size } from "../../tokens/schema.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { SortButton } from "../SortButton/SortButton.js";

export interface TableTokens {
  /** Background of the header row. */
  headerBackground: string;
  /** Background of selected rows. */
  selectedBackground: string;
  /** Tallest the table gets before its body scrolls (with `stickyHeader`). */
  maxHeight: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    table: TableTokens;
  }
}

export type { SortDirection, TableSort } from "../../foundations/sort.js";

export interface TableColumn<Row> {
  key: string;
  header: ReactNode;
  /** What the cell shows. Default: `row[key]`. */
  cell?: (row: Row) => ReactNode;
  /** Header becomes a sort button. */
  sortable?: boolean;
  /** What sorting compares. Default: `row[key]` (numbers as numbers, text in the locale's order). */
  sortValue?: (row: Row) => string | number | null | undefined;
  /** `end` for numbers. */
  align?: "start" | "end";
  /** Any CSS width for the column. */
  width?: string;
  /** This column's cells name their rows (screen readers announce it with each cell). Default: the first column. */
  rowHeader?: boolean;
}

export interface TableLabels {
  /** Name of a row's checkbox. Default: "Select row" plus the row header's text when it is a string. */
  selectRow: (rowName: string) => string;
  selectAll: string;
  /** Shown when there are no rows. */
  empty: ReactNode;
}

export interface TableProps<Row> {
  /** The table's caption: its accessible name, shown above it unless `captionHidden`. */
  caption: ReactNode;
  /** Hides the caption visually; it still names the table. */
  captionHidden?: boolean;
  /** The columns, in display order. */
  columns: TableColumn<Row>[];
  /** The data, one entry per row. */
  rows: Row[];
  /** A stable id per row (for selection and React keys). */
  getRowId: (row: Row) => string;
  /** The current sort (controlled); `null` is unsorted. */
  sort?: TableSort | null | undefined;
  /** Starting sort when uncontrolled; unsorted when left out. */
  defaultSort?: TableSort | null;
  /** Called when a sortable header is pressed, with the new sort, or `null` when it goes back to unsorted. */
  onSortChange?: ((sort: TableSort | null) => void) | undefined;
  /** You sort the rows (e.g. on a server); the table only shows and reports the sort. */
  manualSort?: boolean;
  /** Adds a checkbox per row and a select-all in the header. */
  selectable?: boolean;
  /** Ids of the selected rows (controlled). */
  selected?: string[] | undefined;
  /** Ids of the rows selected at the start when uncontrolled. */
  defaultSelected?: string[];
  /**
   * Called when a row's checkbox or select-all changes, with the selected ids: those not in `rows` (another page,
   * filtered out) first, then the shown ones in row order. Select-all acts on the shown rows only.
   */
  onSelectionChange?: ((ids: string[]) => void) | undefined;
  /** The header stays visible while the body scrolls inside the table. */
  stickyHeader?: boolean;
  /** Cell padding and text size. Default "md". */
  size?: Size;
  /** Replace the built-in English text: the checkbox names and the empty message. */
  labels?: Partial<TableLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-table-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: TableLabels = {
  selectRow: (name) => (name ? `Select ${name}` : "Select row"),
  selectAll: "Select all rows",
  empty: "Nothing to show",
};

const cellValue = <Row,>(row: Row, key: string) => (row as Record<string, unknown>)[key];

/**
 * Rows of data with headers: sortable columns, optional row selection, and a sticky header. A semantic `<table>`, so
 * screen readers announce headers with every cell.
 */
export function Table<Row>({
  caption,
  captionHidden = false,
  columns,
  rows,
  getRowId,
  sort,
  defaultSort = null,
  onSortChange,
  manualSort = false,
  selectable = false,
  selected,
  defaultSelected = [],
  onSelectionChange,
  stickyHeader = false,
  size = "md",
  labels,
  className,
  style,
}: TableProps<Row>) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const [currentSort, setSort] = useControllableState<TableSort | null>(sort, defaultSort, onSortChange);
  const [chosenIds, setChosen] = useControllableState(selected, defaultSelected, onSelectionChange);
  const chosen = new Set(chosenIds);
  const headerColumn = columns.find((c) => c.rowHeader) ?? columns[0];

  const shown = useMemo(() => {
    if (manualSort || !currentSort) return rows;
    const column = columns.find((c) => c.key === currentSort.key);
    if (!column) return rows;
    const get = (row: Row) => (column.sortValue ? column.sortValue(row) : cellValue(row, column.key));
    return sortRows(rows, get, currentSort.direction);
  }, [rows, columns, currentSort, manualSort]);

  const cycle = (key: string) => setSort(nextSort(currentSort, key));
  const allIds = rows.map(getRowId);
  /** `next` is the choice among the rows shown; ids not among them (another page, filtered out) stay selected. */
  const setSelected = (next: Set<string>) => {
    const here = new Set(allIds);
    setChosen([
      ...chosenIds.filter((rowId) => !here.has(rowId)),
      ...allIds.filter((rowId) => next.has(rowId)),
    ]);
  };

  const chosenCount = allIds.filter((rowId) => chosen.has(rowId)).length;
  const rowName = (row: Row) => {
    const v = headerColumn?.cell ? headerColumn.cell(row) : cellValue(row, headerColumn?.key ?? "");
    return typeof v === "string" || typeof v === "number" ? String(v) : "";
  };

  return (
    <div
      className={className ? `cy-table ${className}` : "cy-table"}
      data-size={size}
      data-sticky={stickyHeader ? "" : undefined}
      style={style}
    >
      {/* With a sticky header the table scrolls inside this region, which must be reachable by keyboard. */}
      <div
        className="cy-table-scroll cy-reset"
        {...(stickyHeader ? { tabIndex: 0, role: "region", "aria-labelledby": `${id}-caption` } : {})}
      >
        <table className="cy-table-table cy-reset">
          <caption
            id={`${id}-caption`}
            className={`cy-table-caption cy-reset${captionHidden ? " cy-visually-hidden" : ""}`}
          >
            {caption}
          </caption>
          <thead className="cy-reset">
            <tr className="cy-reset">
              {selectable && (
                <th scope="col" className="cy-table-th cy-table-select cy-reset">
                  <Checkbox
                    label={<span className="cy-visually-hidden">{text.selectAll}</span>}
                    checked={allIds.length > 0 && chosenCount === allIds.length}
                    indeterminate={chosenCount > 0 && chosenCount < allIds.length}
                    disabled={allIds.length === 0}
                    onChange={(on) => setSelected(on ? new Set(allIds) : new Set())}
                  />
                </th>
              )}
              {columns.map((column) => {
                const sorted = currentSort?.key === column.key ? currentSort.direction : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className="cy-table-th cy-reset"
                    data-align={column.align}
                    aria-sort={column.sortable ? (sorted ?? "none") : undefined}
                    style={column.width ? { inlineSize: column.width } : undefined}
                  >
                    {column.sortable ? (
                      <SortButton direction={sorted} align={column.align} onClick={() => cycle(column.key)}>
                        {column.header}
                      </SortButton>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="cy-reset">
            {shown.length === 0 ? (
              <tr className="cy-reset">
                <td
                  className="cy-table-td cy-table-empty cy-reset"
                  colSpan={columns.length + (selectable ? 1 : 0)}
                >
                  {text.empty}
                </td>
              </tr>
            ) : (
              shown.map((row) => {
                const rowId = getRowId(row);
                const isChosen = chosen.has(rowId);
                return (
                  <tr key={rowId} className="cy-table-row cy-reset" data-selected={isChosen ? "" : undefined}>
                    {selectable && (
                      <td className="cy-table-td cy-table-select cy-reset">
                        <Checkbox
                          label={<span className="cy-visually-hidden">{text.selectRow(rowName(row))}</span>}
                          checked={isChosen}
                          onChange={(on) => {
                            const next = new Set(chosen);
                            if (on) next.add(rowId);
                            else next.delete(rowId);
                            setSelected(next);
                          }}
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const content = column.cell
                        ? column.cell(row)
                        : (cellValue(row, column.key) as ReactNode);
                      return column === headerColumn ? (
                        <th
                          key={column.key}
                          scope="row"
                          className="cy-table-td cy-table-rowheader cy-reset"
                          data-align={column.align}
                        >
                          {content}
                        </th>
                      ) : (
                        <td key={column.key} className="cy-table-td cy-reset" data-align={column.align}>
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
