import {
  type ClipboardEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { useDrag } from "../../foundations/drag.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { isComposing, stepKey } from "../../foundations/keys.js";
import { clamp } from "../../foundations/math.js";
import { nextSorts, sortRowsBy, type TableSort } from "../../foundations/sort.js";
import { textMatches } from "../../foundations/text-match.js";
import { useVirtualWindow } from "../../foundations/virtual-window.js";
import { chevronRight } from "../../icons/chevron-right.js";
import { moreVertical } from "../../icons/more-vertical.js";
import type { Tone } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu, type MenuEntry } from "../Menu/Menu.js";
import { Select } from "../Select/Select.js";
import { SortButton } from "../SortButton/SortButton.js";
import { TextField } from "../TextField/TextField.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

/** The value inside a cell: its tooltip shows only while this is cut short. */
const cellValue = (cell: HTMLElement) => cell.querySelector<HTMLElement>(".cy-data-grid-value");

export interface DataGridTokens {
  /** Background of an open row's details panel. */
  detailsBackground: string;
  /** Height of the grid (it scrolls inside, in both directions). */
  height: string;
  /** Height of a row (never less than the hit area: 44px on a touch screen). */
  rowHeight: string;
  /** Height of the header row. */
  headerHeight: string;
  /** Background of the header row. */
  headerBackground: string;
  /** Background of selected rows and cells. */
  selectedBackground: string;
  /** Inline padding of a cell. */
  cellPadding: string;
  /** Text colour of cells whose `cellKind` is "null" (an empty value). */
  nullColor: string;
  /** Text colour of cells whose `cellKind` is "number". */
  numberColor: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    dataGrid: DataGridTokens;
  }
}

export type { SortDirection, TableSort } from "../../foundations/sort.js";

/** What kind of value a cell holds, for its styling: an empty value (muted, italic) or a number. */
export type DataGridCellKind = "null" | "number";

export interface DataGridColumn<Row> {
  /** Unique key of the column; also the default field read from each row. */
  key: string;
  /** The header's content. */
  header: ReactNode;
  /** Starting width in CSS pixels. Default 160. A new value replaces a width the user dragged. */
  width?: number | undefined;
  /** Narrowest the column can be resized to. Default 48. */
  minWidth?: number;
  /** Widest the column can be resized to. Default: no limit. */
  maxWidth?: number;
  /** `end` for numbers. */
  align?: "start" | "end";
  /** The header becomes a sort button. */
  sortable?: boolean;
  /** The header's edge can be dragged (and Alt+Left/Right pressed on the header) to change the width. */
  resizable?: boolean;
  /** What the cell shows (format values here). Default: `value(row)` as text. */
  cell?: (row: Row) => ReactNode;
  /** The cell's raw value: what sorting compares and copying writes. Default: `row[key]`. */
  value?: (row: Row) => unknown;
  /**
   * The full value of a cell, shown in a Tooltip on hover and keyboard focus only while the cell's text is cut short
   * with an ellipsis. It repeats what the cell holds, so it is not read again. Nothing: no tooltip.
   */
  tooltip?: (row: Row) => ReactNode;
  /** The kind of value the cell holds: "null" (an empty value, muted and italic) or "number". Nothing: plain text. */
  cellKind?: (row: Row) => DataGridCellKind | undefined;
  /** Colours the cell's text with a tone (a status, a match); it wins over the kind's colour. Nothing: no tone. */
  cellTone?: (row: Row) => Tone | undefined;
  /**
   * The column's name as plain text, for the cell editor, the filter field and the column menu ("Edit Name"). Default:
   * `header` when it is text, else `key`.
   */
  label?: string | undefined;
  /**
   * The cells can be edited (all, or the rows this returns true for): Enter or F2 opens the editor, typing a character
   * starts it with that character, a double-click opens it. The grid's `onCellEdit` receives the new value.
   */
  editable?: boolean | ((row: Row) => boolean) | undefined;
  /**
   * How a cell is edited: `text` (default, a string), `number` (a number, or null when emptied; anything else is
   * refused) or `select` (one of `options`, committed as it is chosen).
   */
  editor?: "text" | "number" | "select" | undefined;
  /** The choices of a `select` editor. */
  options?: { value: string; label: string }[] | undefined;
  /**
   * A field for this column in a filter row under the header. `text` keeps rows whose value holds the typed text
   * (ignoring case); `number` takes a number or a comparison (`>30`, `<=40`, `30..40`); a function `(row, query)` keeps
   * the rows it returns true for. An empty field filters nothing.
   */
  filter?: "text" | "number" | ((row: Row, query: string) => boolean) | undefined;
}

/** One cell, by its row's id and its column's key (so it survives sorting and loading more rows). */
export interface DataGridCell {
  rowId: string;
  key: string;
}

/** A rectangle of cells between two corners: where the selection started and where it ends now. */
export interface DataGridRange {
  anchor: DataGridCell;
  focus: DataGridCell;
}

export interface DataGridLabels {
  /** Shown when there are no rows. */
  empty: ReactNode;
  /** The cell editor's name, from the column's name. Default "Edit Name". */
  edit: (column: string) => string;
  /** Shown under a number editor holding text that is not a number. Default "Enter a number". */
  invalidNumber: string;
  /** A filter field's name, from the column's name. Default "Filter Name". */
  filter: (column: string) => string;
  /** The filter fields' placeholder. Default "Filter…". */
  filterPlaceholder: string;
  /** A column menu's name and button, from the column's name. Default "Name column options". */
  columnMenu: (column: string) => string;
  /** Column menu items. Defaults "Sort ascending", "Sort descending", "Clear sort". */
  sortAscending: string;
  sortDescending: string;
  clearSort: string;
  /** Column menu items. Defaults "Move left", "Move right" (the reading direction's start and end). */
  moveLeft: string;
  moveRight: string;
  /** Column menu item. Default "Hide column". */
  hide: string;
  /** The column menu's submenu of every column, to show or hide each. Default "Columns". */
  columns: string;
  /** Said after a sorted header's name when the grid sorts by several columns. Default "sort 2". */
  sortRank: (rank: number) => string;
  /** The row details toggle. Defaults "Show details", "Hide details". */
  showDetails: string;
  hideDetails: string;
  /** The header of the row details toggles' column. Default "Details". */
  details: string;
}

export interface DataGridProps<Row> {
  /** Accessible name of the grid. */
  label: string;
  /** The columns, in display order. */
  columns: DataGridColumn<Row>[];
  /** The data, one entry per row. */
  rows: readonly Row[];
  /** A stable, unique id per row (selection and React keys). */
  getRowId: (row: Row) => string;
  /** The current sort (controlled); `null` is unsorted. */
  sort?: TableSort | null | undefined;
  /** Starting sort when uncontrolled; unsorted when left out. */
  defaultSort?: TableSort | null;
  /** Called when a sortable header is pressed, with the new sort, or `null` when it goes back to unsorted. */
  onSortChange?: ((sort: TableSort | null) => void) | undefined;
  /** You sort the rows (e.g. on a server); the grid only shows and reports the sort. */
  manualSort?: boolean;
  /**
   * Shift+click (or Shift+Enter) on a sortable header adds it as the next sort key, turns it around, then removes it;
   * a plain press sorts by that column alone. Sorted headers show their priority.
   */
  multiSort?: boolean;
  /** Every sort key in priority order (controlled), for `multiSort`. Wins over `sort`. */
  sorts?: TableSort[] | undefined;
  /** Sort keys at the start when uncontrolled. */
  defaultSorts?: TableSort[];
  /** Called with every sort key when they change; `onSortChange` gets the first. */
  onSortsChange?: ((sorts: TableSort[]) => void) | undefined;
  /** The filter fields' text by column key (controlled), for columns with `filter`. */
  filters?: Record<string, string> | undefined;
  /** Filter text at the start when uncontrolled. */
  defaultFilters?: Record<string, string>;
  /** Called with every filter field's text when one changes. */
  onFiltersChange?: ((filters: Record<string, string>) => void) | undefined;
  /** You filter the rows (e.g. on a server); the grid only shows the fields and reports their text. */
  manualFilter?: boolean;
  /**
   * A menu on every header (its button, Alt+Down, Shift+F10 or the context menu key on the header): sort, move the
   * column left or right, hide it, and show hidden columns again.
   */
  columnMenu?: boolean;
  /** Column keys in display order (controlled); columns it leaves out follow in their own order. */
  columnOrder?: string[] | undefined;
  /** Column order at the start when uncontrolled. */
  defaultColumnOrder?: string[];
  /** Called with every column key in the new order when a column is moved. */
  onColumnOrderChange?: ((keys: string[]) => void) | undefined;
  /** Keys of the hidden columns (controlled). */
  hiddenColumns?: string[] | undefined;
  /** Hidden columns at the start when uncontrolled. */
  defaultHiddenColumns?: string[];
  /** Called with the hidden column keys when one is hidden or shown. */
  onHiddenColumnsChange?: ((keys: string[]) => void) | undefined;
  /**
   * Row details: a first column whose cell shows or hides this content in a panel under the row (a click, Enter or
   * Space on it). The rows below move down; the grid stays virtual.
   */
  renderRowDetails?: ((row: Row) => ReactNode) | undefined;
  /** Ids of the rows whose details are open (controlled). */
  expandedRows?: string[] | undefined;
  /** Rows open at the start when uncontrolled. */
  defaultExpandedRows?: string[];
  /** Called with the ids of the open rows when one opens or closes. */
  onExpandedRowsChange?: ((ids: string[]) => void) | undefined;
  /** A cell was edited: its row, its column's key and the new value (a string, a number or null, or an option's value). */
  onCellEdit?: ((row: Row, key: string, value: unknown) => void) | undefined;
  /** Called when a column's width has been changed by dragging its edge or by Alt+Left/Right, with the new width. */
  onColumnResize?: ((key: string, width: number) => void) | undefined;
  /**
   * What clicking, Space and the arrow keys select: "none" (default), "row" (rows: Ctrl/Cmd+click toggles,
   * Shift+click and Shift+arrows extend), "cell" (one cell, following focus) or "range" (a rectangle of cells:
   * Shift+click and Shift+arrows extend it). Ctrl/Cmd+C copies the selection as tab-separated text.
   */
  selectionMode?: "none" | "row" | "cell" | "range";
  /** Ids of the selected rows, with `selectionMode="row"` (controlled), as Table's `selected`. */
  selected?: string[] | undefined;
  /** Ids of the rows selected at the start when uncontrolled. */
  defaultSelected?: string[];
  /** Called with the selected row ids when they change. */
  onSelectionChange?: ((ids: string[]) => void) | undefined;
  /** The selected cells, with `selectionMode` "cell" or "range" (controlled); `null` is none. */
  selectedRange?: DataGridRange | null | undefined;
  /** The cells selected at the start when uncontrolled. */
  defaultSelectedRange?: DataGridRange | null;
  /** Called with the selected cells when they change. */
  onSelectedRangeChange?: ((range: DataGridRange | null) => void) | undefined;
  /** A row's cell was clicked or tapped. */
  onRowClick?: ((row: Row, index: number) => void) | undefined;
  /** Enter on a row's cell, or a double-click on it (open the row), as VirtualList's and Tree's `onAction`. */
  onAction?: ((row: Row, index: number) => void) | undefined;
  /**
   * Called once the last rows come into view, once per row count: load the next rows and append them ("load more").
   * For pages, put a `Pagination` under the grid and pass it one page of rows.
   */
  onEndReached?: (() => void) | undefined;
  /** Row height and text size: "sm" is dense. Default "md". */
  size?: "sm" | "md";
  /** Replace the built-in English text: the empty message, the editor, filter, column menu and details names. */
  labels?: Partial<DataGridLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only (e.g. `blockSize`). Restyle through --cy-data-grid-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: DataGridLabels = {
  empty: "Nothing to show",
  edit: (column) => `Edit ${column}`,
  invalidNumber: "Enter a number",
  filter: (column) => `Filter ${column}`,
  filterPlaceholder: "Filter…",
  columnMenu: (column) => `${column} column options`,
  sortAscending: "Sort ascending",
  sortDescending: "Sort descending",
  clearSort: "Clear sort",
  moveLeft: "Move left",
  moveRight: "Move right",
  hide: "Hide column",
  columns: "Columns",
  sortRank: (rank) => `sort ${rank}`,
  showDetails: "Show details",
  hideDetails: "Hide details",
  details: "Details",
};
/** The key of the row details toggle column, never a data column's. */
const DETAILS = "\u0000details";
/** Width of the details toggle column, in CSS pixels: a 44px hit area on touch screens. */
const DETAILS_WIDTH = 44;
/** A data column's plain-text name. */
const nameOf = <Row,>(c: DataGridColumn<Row>) => c.label ?? (typeof c.header === "string" ? c.header : c.key);
const canEdit = <Row,>(c: DataGridColumn<Row>, row: Row) =>
  c.key !== DETAILS && (typeof c.editable === "function" ? c.editable(row) : c.editable === true);

/** Whether a number filter's query keeps `value`. Text that is no number or comparison keeps everything. */
function numberFilter(value: unknown, query: string): boolean {
  const num = String.raw`(-?\d+(?:\.\d+)?)`;
  const range = new RegExp(`^${num}\\s*\\.\\.\\s*${num}$`).exec(query);
  const compare = new RegExp(`^(<=|>=|<|>|=)?\\s*${num}$`).exec(query);
  if (!range && !compare) return true;
  const n = typeof value === "number" ? value : value === null || value === "" ? Number.NaN : Number(value);
  if (!Number.isFinite(n)) return false;
  if (range) return n >= Number(range[1]) && n <= Number(range[2]);
  const [, op = "=", at] = compare as RegExpExecArray;
  const to = Number(at);
  return op === "<" ? n < to : op === "<=" ? n <= to : op === ">" ? n > to : op === ">=" ? n >= to : n === to;
}
const DEFAULT_WIDTH = 160;
const DEFAULT_MIN = 48;
/** Keyboard resizing: an arrow moves the edge this far, Shift+arrow `RESIZE_BIG`. */
const RESIZE_STEP = 8;
const RESIZE_BIG = 64;

/** Whether two sort lists (or two missing ones) say the same thing. */
const sameSorts = (a: readonly TableSort[] | undefined, b: readonly TableSort[] | undefined) =>
  a === b ||
  (!!a &&
    !!b &&
    a.length === b.length &&
    a.every((s, i) => s.key === b[i]?.key && s.direction === b[i]?.direction));
const rawValue = <Row,>(row: Row, column: DataGridColumn<Row>) =>
  column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
/** A raw value as text: empty for null and undefined, JSON for objects. */
const asText = (v: unknown) =>
  v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
/** A value as one field of tab-separated text: quoted when it holds a tab, a line break or a quote. */
function tsvField(v: unknown): string {
  const text = asText(v);
  return /[\t\n\r"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
const cellAttr = (row: number, col: number) => `${row}:${col}`;

/**
 * A data grid for large results: rows and columns rendered only where they are in view (a hundred thousand rows by
 * fifty columns stay quick), a sticky header, sorting by one or more columns, column filters, resizable, movable and
 * hideable columns, cell editing, row details, row, cell or range selection copied as tab-separated text, and the APG
 * grid keyboard.
 */
export function DataGrid<Row>({
  label,
  columns: given,
  rows,
  getRowId,
  sort,
  defaultSort = null,
  onSortChange,
  manualSort = false,
  multiSort = false,
  sorts,
  defaultSorts,
  onSortsChange,
  filters,
  defaultFilters = {},
  onFiltersChange,
  manualFilter = false,
  columnMenu = false,
  columnOrder,
  defaultColumnOrder = [],
  onColumnOrderChange,
  hiddenColumns,
  defaultHiddenColumns = [],
  onHiddenColumnsChange,
  renderRowDetails,
  expandedRows,
  defaultExpandedRows = [],
  onExpandedRowsChange,
  onCellEdit,
  onColumnResize,
  selectionMode = "none",
  selected,
  defaultSelected = [],
  onSelectionChange,
  selectedRange,
  defaultSelectedRange = null,
  onSelectedRangeChange,
  onRowClick,
  onAction,
  onEndReached,
  size = "md",
  labels,
  className,
  style,
}: DataGridProps<Row>) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  // Every sort key in priority order; `sort` and `onSortChange` speak for the first. A controlled sort is kept by
  // what it says, not by identity, so a parent passing a new object of the same sort each render sorts nothing again.
  const givenSorts = sorts ?? (sort === undefined ? undefined : sort ? [sort] : []);
  const sameGiven = useRef(givenSorts);
  if (!sameSorts(sameGiven.current, givenSorts)) sameGiven.current = givenSorts;
  const [sortList, setSortList] = useControllableState<TableSort[]>(
    sameGiven.current,
    defaultSorts ?? (defaultSort ? [defaultSort] : []),
    (next) => {
      onSortsChange?.(next);
      onSortChange?.(next[0] ?? null);
    },
  );
  const [filterText, setFilterText] = useControllableState(filters, defaultFilters, onFiltersChange);
  const [order, setOrder] = useControllableState(columnOrder, defaultColumnOrder, onColumnOrderChange);
  const [hidden, setHidden] = useControllableState(
    hiddenColumns,
    defaultHiddenColumns,
    onHiddenColumnsChange,
  );
  const [expanded, setExpanded] = useControllableState(
    expandedRows,
    defaultExpandedRows,
    onExpandedRowsChange,
  );
  const [chosenRows, setChosenRows] = useControllableState(selected, defaultSelected, onSelectionChange);
  const [range, setRange] = useControllableState<DataGridRange | null>(
    selectedRange,
    defaultSelectedRange,
    onSelectedRangeChange,
  );

  // The columns in display order (the given order, then `order`), all of them and the ones shown.
  const ordered = useMemo(() => {
    const byKey = new Map(given.map((c) => [c.key, c]));
    const first = order.flatMap((k) => byKey.get(k) ?? []);
    const placed = new Set(first);
    return [...first, ...given.filter((c) => !placed.has(c))];
  }, [given, order]);
  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);
  const dataColumns = useMemo(() => ordered.filter((c) => !hiddenSet.has(c.key)), [ordered, hiddenSet]);
  const details = !!renderRowDetails;
  const columns = useMemo<DataGridColumn<Row>[]>(
    () => (details ? [{ key: DETAILS, header: null, width: DETAILS_WIDTH }, ...dataColumns] : dataColumns),
    [details, dataColumns],
  );
  const isDetails = (c: DataGridColumn<Row> | undefined) => c?.key === DETAILS;

  // Widths the user set, each remembered with the `width` prop it replaced (a new prop value wins again).
  const [resized, setResized] = useState<Record<string, { from: number | undefined; width: number }>>({});
  const widths = columns.map((c) => {
    const own = resized[c.key];
    return own && own.from === c.width ? own.width : (c.width ?? DEFAULT_WIDTH);
  });
  const limits = (c: DataGridColumn<Row>): [number, number] => [
    c.minWidth ?? DEFAULT_MIN,
    c.maxWidth ?? Number.POSITIVE_INFINITY,
  ];
  const resize = (col: number, width: number) => {
    const c = columns[col] as DataGridColumn<Row>;
    const [lo, hi] = limits(c);
    const next = Math.round(clamp(width, lo, hi));
    setResized((r) => ({ ...r, [c.key]: { from: c.width, width: next } }));
    return next;
  };

  // Work over every row happens once per change of the rows, the filters or the sort, never per scroll. Only the
  // columns shown filter and sort: a hidden column's filter and sort are kept, and apply again when it is shown.
  const filtering = dataColumns.some((c) => c.filter && (filterText[c.key] ?? "").trim());
  const kept = useMemo(() => {
    if (manualFilter || !filtering) return rows;
    const active = dataColumns.flatMap((c) => {
      const query = (filterText[c.key] ?? "").trim();
      return c.filter && query ? [{ c, query }] : [];
    });
    return rows.filter((row) =>
      active.every(({ c, query }) =>
        typeof c.filter === "function"
          ? c.filter(row, query)
          : c.filter === "number"
            ? numberFilter(rawValue(row, c), query)
            : textMatches(asText(rawValue(row, c)), query),
      ),
    );
  }, [rows, dataColumns, filterText, filtering, manualFilter]);
  const shown = useMemo(() => {
    if (manualSort || !sortList.length) return kept;
    const byKey = new Map(dataColumns.map((c) => [c.key, c]));
    const usable = sortList.filter((s) => byKey.has(s.key));
    return usable.length
      ? sortRowsBy(kept, usable, (row, key) => rawValue(row, byKey.get(key) as DataGridColumn<Row>))
      : kept;
  }, [kept, dataColumns, sortList, manualSort]);
  // `getRowId` is read through a ref: an inline function (a new one each render) keys the rows only when they change.
  const rowIdOf = useRef(getRowId);
  rowIdOf.current = getRowId;
  const ids = useMemo(() => shown.map((row) => rowIdOf.current(row)), [shown]);
  const rowIndex = useMemo(() => new Map(ids.map((id, i) => [id, i])), [ids]);
  const chosenSet = useMemo(() => new Set(chosenRows), [chosenRows]);
  const colIndex = (key: string) => columns.findIndex((c) => c.key === key);
  const cellRef = (row: number, col: number): DataGridCell => ({
    rowId: ids[row] as string,
    key: (columns[col] as DataGridColumn<Row>).key,
  });
  /** The selected rectangle in display indices, or null. */
  const box = (() => {
    if (!range || (selectionMode !== "cell" && selectionMode !== "range")) return null;
    const r1 = rowIndex.get(range.anchor.rowId);
    const r2 = rowIndex.get(range.focus.rowId);
    const c1 = colIndex(range.anchor.key);
    const c2 = colIndex(range.focus.key);
    if (r1 === undefined || r2 === undefined || c1 < 0 || c2 < 0) return null;
    return {
      top: Math.min(r1, r2),
      bottom: Math.max(r1, r2),
      start: Math.min(c1, c2),
      end: Math.max(c1, c2),
    };
  })();

  // The cell with the tab stop: row -1 is the header. Kept by its row's id and its column's key too, so it stays on
  // its cell when rows or columns change around it (and falls back to its place when they are gone).
  const [active, setActiveState] = useState<{ row: number; col: number; id?: string; key?: string }>({
    row: 0,
    col: 0,
  });
  const setActive = ({ row, col }: { row: number; col: number }) =>
    setActiveState({
      row,
      col,
      ...(row >= 0 && ids[row] !== undefined ? { id: ids[row] } : {}),
      ...(columns[col] ? { key: columns[col].key } : {}),
    });
  const activeRow = clamp(
    (active.id === undefined ? undefined : rowIndex.get(active.id)) ?? active.row,
    -1,
    shown.length - 1,
  );
  const keyCol = active.key === undefined ? -1 : colIndex(active.key);
  const activeCol = clamp(keyCol >= 0 ? keyCol : active.col, 0, columns.length - 1);
  const moveFocus = useRef(false);
  /** Where Shift+click and Shift+arrows extend from, in row mode. */
  const rowAnchor = useRef<string | null>(null);

  // Row details: the open rows (by display index, in order) and each panel's measured height.
  const openSet = useMemo(() => new Set(details ? expanded : []), [details, expanded]);
  const openRows = useMemo(
    () => (details ? expanded.flatMap((id) => rowIndex.get(id) ?? []).sort((a, b) => a - b) : []),
    [details, expanded, rowIndex],
  );
  const [panelSizes, setPanelSizes] = useState<ReadonlyMap<string, number>>(() => new Map());
  const [rowBase, setRowBase] = useState(0);
  const sizes = useMemo(() => {
    if (!openRows.length || !rowBase) return undefined;
    const out = new Array<number>(ids.length).fill(rowBase);
    for (const r of openRows) out[r] = rowBase + (panelSizes.get(ids[r] as string) ?? rowBase * 2);
    return out;
  }, [openRows, rowBase, ids, panelSizes]);
  /** Rows before `r` whose panel is open: each adds a row to the grid's numbering. */
  const panelsBefore = (r: number) => {
    let n = 0;
    for (const o of openRows) if (o < r) n++;
    return n;
  };
  const filterRow = given.some((c) => c.filter);
  const headRows = filterRow ? 2 : 1;

  const [headerSize, setHeaderSize] = useState(0);
  const rowsWin = useVirtualWindow(root, {
    count: shown.length,
    rowSelector: ".cy-data-grid-row",
    keep: activeRow,
    inset: headerSize,
    overscan: 4,
    ...(sizes ? { sizes } : {}),
  });
  const colsWin = useVirtualWindow(root, {
    count: columns.length,
    sizes: widths,
    keep: activeCol,
    overscan: 2,
    axis: "x",
  });
  useClientLayoutEffect(() => {
    const h = (head.current as HTMLDivElement).offsetHeight;
    if (h !== headerSize) setHeaderSize(h);
    // A row's own height (the panels' rows are measured without them), for placing rows when panels are open.
    if (details && rowsWin.rowSize !== rowBase && !sizes) setRowBase(rowsWin.rowSize);
  });
  // Each open panel is measured as it renders and again when it changes size.
  const panelObserver = useRef<ResizeObserver | null>(null);
  useClientLayoutEffect(() => {
    if (!details) return;
    const observer = new ResizeObserver((entries) => {
      const sized: [string, number][] = [];
      for (const { target } of entries) {
        const id = (target as HTMLElement).dataset.rowId;
        const h = (target as HTMLElement).offsetHeight;
        if (id !== undefined && h) sized.push([id, h]);
      }
      if (sized.length)
        setPanelSizes((all) => {
          const changed = sized.filter(([id, h]) => all.get(id) !== h);
          return changed.length ? new Map([...all, ...changed]) : all;
        });
    });
    panelObserver.current = observer;
    return () => {
      observer.disconnect();
      panelObserver.current = null;
    };
  }, [details]);
  useClientLayoutEffect(() => {
    const observer = panelObserver.current;
    if (!observer) return;
    observer.disconnect();
    for (const panel of root.current?.querySelectorAll(".cy-data-grid-details-row") ?? [])
      observer.observe(panel);
  });

  // Editing: the cell being edited, by its row's id and its column's key, and the text in the editor.
  const [editing, setEditingState] = useState<{
    id: string;
    key: string;
    draft: string;
    invalid: boolean;
  } | null>(null);
  const editingRef = useRef(editing);
  const setEditing = (next: typeof editing) => {
    editingRef.current = next;
    setEditingState(next);
  };
  const editingAt = editing
    ? { row: rowIndex.get(editing.id) ?? -1, col: colIndex(editing.key) }
    : { row: -1, col: -1 };
  const editorFocus = useRef(false);
  useClientLayoutEffect(() => {
    if (!editorFocus.current) return;
    editorFocus.current = false;
    const field = root.current?.querySelector<HTMLElement>(
      ".cy-data-grid-editor input, .cy-data-grid-editor [role='combobox']",
    );
    field?.focus({ preventScroll: true });
    if (field instanceof HTMLInputElement) field.setSelectionRange(field.value.length, field.value.length);
  });

  useClientLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    if (activeRow >= 0) rowsWin.reveal(activeRow);
    colsWin.reveal(activeCol);
    root.current?.querySelector<HTMLElement>(`[data-cell="${cellAttr(activeRow, activeCol)}"]`)?.focus({
      preventScroll: true,
    });
  });

  // "Load more": once per row count, when the end of the rows is in view.
  const endFor = useRef(-1);
  const atEnd =
    shown.length > 0 &&
    rowsWin.total - (rowsWin.view.top + rowsWin.view.height - headerSize) <= rowsWin.rowSize * 4;
  useClientLayoutEffect(() => {
    if (!onEndReached || !atEnd || rowsWin.view.height === 0 || endFor.current === shown.length) return;
    endFor.current = shown.length;
    onEndReached();
  });

  const go = (row: number, col: number) => {
    setActive({ row, col });
    moveFocus.current = true;
  };
  const selectRows = (to: number, how: "only" | "toggle" | "extend") => {
    const id = ids[to] as string;
    if (how === "extend" && rowAnchor.current !== null && rowIndex.has(rowAnchor.current)) {
      const from = rowIndex.get(rowAnchor.current) as number;
      setChosenRows(ids.slice(Math.min(from, to), Math.max(from, to) + 1));
      return;
    }
    rowAnchor.current = id;
    if (how === "toggle")
      setChosenRows(chosenSet.has(id) ? chosenRows.filter((k) => k !== id) : [...chosenRows, id]);
    else setChosenRows([id]);
  };
  const selectCells = (row: number, col: number, extend: boolean) => {
    const at = cellRef(row, col);
    if (extend && selectionMode === "range" && range && box) setRange({ anchor: range.anchor, focus: at });
    else setRange({ anchor: at, focus: at });
  };
  /** What a click, Space or a move to body cell (row, col) selects. */
  const select = (row: number, col: number, how: "only" | "toggle" | "extend", moved: boolean) => {
    if (row < 0) return;
    if (selectionMode === "row") {
      if (!moved || how === "extend") selectRows(row, how);
    } else if (selectionMode === "cell" || selectionMode === "range") selectCells(row, col, how === "extend");
  };

  const toggleDetails = (row: number) => {
    const id = ids[row] as string;
    setExpanded(openSet.has(id) ? expanded.filter((k) => k !== id) : [...expanded, id]);
  };

  // ── Editing ──
  const startEdit = (row: number, col: number, draft?: string) => {
    const column = columns[col] as DataGridColumn<Row>;
    setActive({ row, col });
    editorFocus.current = true;
    setEditing({
      id: ids[row] as string,
      key: column.key,
      draft: draft ?? asText(rawValue(shown[row] as Row, column)),
      invalid: false,
    });
  };
  /** Ends the edit with `value` (or the editor's text): false when a number editor holds no number. */
  const commit = (value?: string) => {
    const e = editingRef.current;
    if (!e) return true;
    const r = rowIndex.get(e.id);
    const column = given.find((c) => c.key === e.key);
    if (r === undefined || !column) {
      setEditing(null);
      return true;
    }
    const draft = value ?? e.draft;
    let out: unknown = draft;
    if (column.editor === "number") {
      const t = draft.trim();
      const n = Number(t);
      if (t && !Number.isFinite(n)) {
        setEditing({ ...e, invalid: true });
        return false;
      }
      out = t ? n : null;
    }
    setEditing(null);
    onCellEdit?.(shown[r] as Row, e.key, out);
    return true;
  };
  const cancelEdit = () => setEditing(null);
  const onEditorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // The grid's keys stay out of the editor; a Select's own keys (opening, choosing) go first.
    event.stopPropagation();
    if (event.defaultPrevented || isComposing(event)) return;
    const { row, col } = editingAt;
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
      go(row, col);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (commit()) go(row, col);
    } else if (event.key === "Tab") {
      event.preventDefault();
      if (!commit()) return;
      const step = event.shiftKey ? -1 : 1;
      const to = col + step;
      if (to >= 0 && to < columns.length) go(row, to);
      else if (row + step >= 0 && row + step < shown.length)
        go(row + step, step > 0 ? 0 : columns.length - 1);
      else go(row, col);
    }
  };
  // Leaving the editor (a click elsewhere, focus moved away) commits it; text that is no number is dropped.
  const onEditorBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    if (!commit()) cancelEdit();
  };

  // ── Column menu ──
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const moveColumn = (key: string, step: -1 | 1) => {
    const keys = ordered.map((c) => c.key);
    const shownKeys = dataColumns.map((c) => c.key);
    const neighbour = shownKeys[shownKeys.indexOf(key) + step];
    if (neighbour === undefined) return;
    const rest = keys.filter((k) => k !== key);
    const at = rest.indexOf(neighbour) + (step > 0 ? 1 : 0);
    rest.splice(at, 0, key);
    setOrder(rest);
  };
  /** The header to focus once the columns have changed (a column moved, hidden or shown from its menu). */
  const focusHeader = useRef<string | null>(null);
  const colsRef = useRef(columns);
  colsRef.current = columns;
  const menuOpen = useRef(menuFor);
  menuOpen.current = menuFor;
  useClientLayoutEffect(() => {
    const key = focusHeader.current;
    if (key === null) return;
    focusHeader.current = null;
    const at = columns.findIndex((c) => c.key === key);
    if (at >= 0) go(-1, at);
  });
  const runMenu = (key: string, value: string) => {
    const shownKeys = dataColumns.map((c) => c.key);
    focusHeader.current = key;
    if (value === "sort:asc" || value === "sort:desc")
      setSortList([{ key, direction: value === "sort:asc" ? "ascending" : "descending" }]);
    else if (value === "sort:clear") setSortList(sortList.filter((s) => s.key !== key));
    else if (value === "move:left" || value === "move:right") moveColumn(key, value === "move:left" ? -1 : 1);
    else if (value === "hide") {
      if (shownKeys.length <= 1) return;
      setHidden([...hidden, key]);
      // Its neighbour's header takes focus: its own is gone.
      const at = shownKeys.indexOf(key);
      focusHeader.current = shownKeys[at + 1] ?? shownKeys[at - 1] ?? null;
    } else if (value.startsWith("show:")) {
      const which = value.slice(5);
      if (hiddenSet.has(which)) setHidden(hidden.filter((k) => k !== which));
      else if (shownKeys.length > 1) {
        setHidden([...hidden, which]);
        if (which === key) focusHeader.current = shownKeys.find((k) => k !== key) ?? null;
      }
    }
  };
  const menuItems = (column: DataGridColumn<Row>): MenuEntry[] => {
    const shownKeys = dataColumns.map((c) => c.key);
    const at = shownKeys.indexOf(column.key);
    const sorted = sortList.some((s) => s.key === column.key);
    const entries: MenuEntry[] = [];
    if (column.sortable)
      entries.push({
        items: [
          { value: "sort:asc", label: text.sortAscending },
          { value: "sort:desc", label: text.sortDescending },
          ...(sorted ? [{ value: "sort:clear", label: text.clearSort }] : []),
        ],
      });
    entries.push({
      items: [
        { value: "move:left", label: text.moveLeft, disabled: at <= 0 },
        { value: "move:right", label: text.moveRight, disabled: at >= shownKeys.length - 1 },
      ],
    });
    entries.push({
      items: [
        { value: "hide", label: text.hide, disabled: shownKeys.length <= 1 },
        {
          value: "columns",
          label: text.columns,
          items: ordered.map((c) => {
            const visible = !hiddenSet.has(c.key);
            return {
              value: `show:${c.key}`,
              label: nameOf(c),
              kind: "checkbox" as const,
              checked: visible,
              disabled: visible && shownKeys.length <= 1,
            };
          }),
        },
      ],
    });
    return entries;
  };

  const copyText = () => {
    let r0 = 0;
    let r1 = -1;
    let c0 = 0;
    let c1 = columns.length - 1;
    let only: Set<string> | null = null;
    if (selectionMode === "row" && chosenRows.length) {
      only = chosenSet;
      r1 = shown.length - 1;
    } else if (box) ({ top: r0, bottom: r1, start: c0, end: c1 } = box);
    const copied = columns.slice(c0, c1 + 1).filter((c) => !isDetails(c));
    const lines: string[] = [];
    for (let r = r0; r <= r1; r++) {
      if (only && !only.has(ids[r] as string)) continue;
      const row = shown[r] as Row;
      lines.push(copied.map((c) => tsvField(rawValue(row, c))).join("\t"));
    }
    return lines.join("\n");
  };
  const onCopy = (event: ClipboardEvent<HTMLDivElement>) => {
    // A field (a filter, an editor) copies its own text.
    if ((event.target as HTMLElement).closest?.("input, textarea")) return;
    // Text selected inside the cells (by dragging) copies as text, the browser's way; otherwise the selected cells.
    // In a shadow root, Chromium keeps the selection on the root; elsewhere the document has it.
    const doc = (root.current as HTMLDivElement).getRootNode() as Partial<Pick<Document, "getSelection">>;
    const chosenText = ((doc.getSelection ? doc : document) as Document).getSelection() as Selection;
    if (chosenText.toString()) return;
    const tsv = copyText();
    if (!tsv) return;
    event.preventDefault();
    event.clipboardData.setData("text/plain", tsv);
  };

  /** The cell an event came from, as display indices; never one inside a menu, an editor or a details panel. */
  const cellOf = (target: EventTarget) => {
    const t = target as HTMLElement;
    if (t.closest?.('[role="menu"], .cy-data-grid-editor, .cy-data-grid-details-row')) return null;
    const el = t.closest?.<HTMLElement>("[data-cell]");
    if (!el || !root.current?.contains(el)) return null;
    const [row, col] = (el.dataset.cell as string).split(":").map(Number) as [number, number];
    return { row, col, el };
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = cellOf(event.target);
    if (!at || isComposing(event)) return;
    const { row, col } = at;
    const last = shown.length - 1;
    const ctrl = event.ctrlKey || event.metaKey;
    const rtl = isRtl(at.el);
    const column = columns[col] as DataGridColumn<Row>;
    if (row < 0 && !isDetails(column)) {
      // The column menu: Alt+Down, Shift+F10 or the context menu key on a header.
      if (
        columnMenu &&
        ((event.altKey && event.key === "ArrowDown") ||
          (event.shiftKey && event.key === "F10") ||
          event.key === "ContextMenu")
      ) {
        event.preventDefault();
        setMenuFor(column.key);
        return;
      }
      // Shift+Enter or Shift+Space on a sortable header adds it as a sort key.
      if (multiSort && column.sortable && event.shiftKey && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        setSortList(nextSorts(sortList, column.key, true));
        return;
      }
    }
    // Alt+Left/Right on a resizable header moves its edge (and on other headers, nothing).
    if (row < 0 && event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      if (!column.resizable) return;
      event.preventDefault();
      const [lo, hi] = limits(column);
      const to = stepKey(event, {
        value: widths[col] as number,
        min: lo,
        max: hi,
        step: RESIZE_STEP,
        big: RESIZE_BIG,
        axis: "x",
        rtl,
        arrowsOnly: true,
      }) as number;
      onColumnResize?.(column.key, resize(col, to));
      return;
    }
    if (row >= 0 && isDetails(column) && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      toggleDetails(row);
      return;
    }
    const editable = row >= 0 && canEdit(column, shown[row] as Row);
    if (editable && (event.key === "Enter" || event.key === "F2")) {
      event.preventDefault();
      startEdit(row, col);
      return;
    }
    if (editable && event.key.length === 1 && event.key !== " " && !ctrl && !event.altKey) {
      event.preventDefault();
      startEdit(row, col, column.editor === "select" ? undefined : event.key);
      return;
    }
    const page = Math.max(
      1,
      Math.floor(((root.current as HTMLDivElement).clientHeight - headerSize) / rowsWin.rowSize) - 1,
    );
    let to: { row: number; col: number } | null = null;
    switch (event.key) {
      case "ArrowDown":
        to = { row: Math.min(row + 1, last), col };
        break;
      case "ArrowUp":
        to = { row: Math.max(row - 1, -1), col };
        break;
      case "ArrowRight":
      case "ArrowLeft": {
        const step = (event.key === "ArrowRight") !== rtl ? 1 : -1;
        to = { row, col: clamp(col + step, 0, columns.length - 1) };
        break;
      }
      case "Home":
        to = { row: ctrl ? Math.min(0, last) : row, col: 0 };
        break;
      case "End":
        to = { row: ctrl ? last : row, col: columns.length - 1 };
        break;
      case "PageDown":
        to = { row: Math.min(row + page, last), col };
        break;
      case "PageUp":
        to = { row: row <= 0 ? -1 : Math.max(row - page, 0), col };
        break;
      case "Enter":
        if (row >= 0) {
          event.preventDefault();
          onAction?.(shown[row] as Row, row);
        }
        return;
      case " ":
        if (row >= 0 && selectionMode !== "none") {
          event.preventDefault();
          select(row, col, ctrl ? "toggle" : event.shiftKey ? "extend" : "only", false);
        }
        return;
      case "a":
        if (ctrl && last >= 0 && (selectionMode === "row" || selectionMode === "range")) {
          event.preventDefault();
          if (selectionMode === "row") setChosenRows([...ids]);
          else setRange({ anchor: cellRef(0, 0), focus: cellRef(last, columns.length - 1) });
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    go(to.row, to.col);
    if (to.row !== row || to.col !== col) select(to.row, to.col, event.shiftKey ? "extend" : "only", true);
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const at = cellOf(event.target);
    if (!at || at.row < 0) return;
    go(at.row, at.col);
    if (isDetails(columns[at.col])) {
      toggleDetails(at.row);
      return;
    }
    select(
      at.row,
      at.col,
      event.shiftKey ? "extend" : event.ctrlKey || event.metaKey ? "toggle" : "only",
      false,
    );
    onRowClick?.(shown[at.row] as Row, at.row);
  };

  // Dragging a header's edge resizes its column (mouse, pen and touch: the edge has touch-action none).
  const dragging = useRef<{ col: number; width: number; sign: number } | null>(null);
  useDrag(head, {
    touchAction: "css",
    onStart: ({ path }) => {
      const edge = path.find(
        (n): n is HTMLElement => n instanceof HTMLElement && n.classList.contains("cy-data-grid-resize"),
      );
      if (!edge) return false;
      const col = Number(edge.dataset.col);
      dragging.current = { col, width: widths[col] as number, sign: isRtl(edge) ? -1 : 1 };
    },
    onMove: ({ delta }) => {
      const d = dragging.current as { col: number; width: number; sign: number };
      resize(d.col, d.width + delta.x * d.sign);
    },
    onEnd: ({ delta }, cancelled) => {
      const d = dragging.current as { col: number; width: number; sign: number };
      dragging.current = null;
      if (cancelled) {
        resize(d.col, d.width);
        return;
      }
      const width = resize(d.col, d.width + delta.x * d.sign);
      if (width !== d.width) onColumnResize?.((columns[d.col] as DataGridColumn<Row>).key, width);
    },
  });

  const tabStop = (row: number, col: number) => (row === activeRow && col === activeCol ? 0 : -1);
  const place = (col: number): CSSProperties => ({
    insetInlineStart: colsWin.offsetOf(col),
    inlineSize: colsWin.sizeOf(col),
  });
  const multi = selectionMode === "row" || selectionMode === "range";
  const ranked = sortList.length > 1;
  const panelCount = openRows.length;

  /** The editor in the cell being edited: a TextField, or a Select for a `select` column. */
  const editor = (column: DataGridColumn<Row>) => {
    const e = editing as NonNullable<typeof editing>;
    const name = text.edit(nameOf(column));
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: delegated keys and focus for the field inside
      <div className="cy-data-grid-editor cy-reset" onKeyDown={onEditorKeyDown} onBlur={onEditorBlur}>
        {column.editor === "select" ? (
          <Select
            label={name}
            labelHidden
            size="sm"
            options={column.options ?? []}
            value={e.draft}
            onChange={(value) => {
              if (commit(value)) go(editingAt.row, editingAt.col);
            }}
          />
        ) : (
          <TextField
            label={name}
            labelHidden
            size="sm"
            value={e.draft}
            inputMode={column.editor === "number" ? "decimal" : undefined}
            error={e.invalid ? text.invalidNumber : undefined}
            onChange={(draft) => setEditing({ ...e, draft, invalid: false })}
          />
        )}
      </div>
    );
  };

  // A windowed grid places its rows and cells by offset, and a cell can sit in a Tooltip's anchor: elements with grid
  // roles, as the APG data grid allows, rather than a table's. Focus is on the cells (one tab stop), not the rows.
  // biome-ignore-start lint/a11y/useSemanticElements: see above
  // biome-ignore-start lint/a11y/useFocusableInteractive: see above
  return (
    <div className={className ? `cy-data-grid ${className}` : "cy-data-grid"} data-size={size} style={style}>
      <div
        ref={root}
        role="grid"
        aria-label={label}
        aria-rowcount={shown.length + headRows + panelCount}
        aria-colcount={columns.length}
        aria-multiselectable={multi || undefined}
        className="cy-data-grid-scroll cy-reset"
        onScroll={(e) => {
          rowsWin.onScroll(e.currentTarget.scrollTop);
          colsWin.onScroll(Math.abs(e.currentTarget.scrollLeft));
        }}
        onKeyDown={onKeyDown}
        onClick={onClick}
        onDoubleClick={(e) => {
          const at = cellOf(e.target);
          if (!at || at.row < 0 || isDetails(columns[at.col])) return;
          if (canEdit(columns[at.col] as DataGridColumn<Row>, shown[at.row] as Row))
            startEdit(at.row, at.col);
          else onAction?.(shown[at.row] as Row, at.row);
        }}
        // With a selection mode, Shift+click selects cells, not text.
        onMouseDown={(e) => {
          if (e.shiftKey && selectionMode !== "none" && cellOf(e.target)) e.preventDefault();
        }}
        onFocus={(e) => {
          // Focus can arrive without our keys (a click, a screen reader): keys then act from here.
          const at = cellOf(e.target);
          if (at && (at.row !== activeRow || at.col !== activeCol)) setActive({ row: at.row, col: at.col });
        }}
        onCopy={onCopy}
      >
        <div className="cy-data-grid-canvas cy-reset" style={{ inlineSize: colsWin.total }}>
          <div ref={head} role="rowgroup" className="cy-data-grid-head cy-reset">
            <div role="row" aria-rowindex={1} className="cy-data-grid-header-row cy-reset">
              {colsWin.indices.map((c) => {
                const column = columns[c] as DataGridColumn<Row>;
                if (isDetails(column))
                  return (
                    <div
                      key={column.key}
                      role="columnheader"
                      aria-colindex={c + 1}
                      className="cy-data-grid-header cy-reset"
                      style={place(c)}
                      data-cell={cellAttr(-1, c)}
                      tabIndex={tabStop(-1, c)}
                    >
                      <span className="cy-visually-hidden">{text.details}</span>
                    </div>
                  );
                const rank = sortList.findIndex((s) => s.key === column.key);
                const sorted = rank >= 0 ? sortList[rank]?.direction : undefined;
                const name = nameOf(column);
                const keys =
                  [
                    column.resizable && "Alt+ArrowLeft Alt+ArrowRight",
                    columnMenu && "Alt+ArrowDown Shift+F10",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined;
                return (
                  <div
                    key={column.key}
                    role="columnheader"
                    aria-colindex={c + 1}
                    aria-sort={column.sortable ? (rank === 0 ? sorted : "none") : undefined}
                    className="cy-data-grid-header cy-reset"
                    data-align={column.align}
                    data-sortable={column.sortable ? "" : undefined}
                    data-sorted={sorted ? "" : undefined}
                    style={place(c)}
                    {...(column.sortable
                      ? {}
                      : {
                          "data-cell": cellAttr(-1, c),
                          tabIndex: tabStop(-1, c),
                          "aria-keyshortcuts": keys,
                        })}
                  >
                    {column.sortable ? (
                      <SortButton
                        fill
                        direction={sorted}
                        rank={ranked && rank >= 0 ? rank + 1 : undefined}
                        align={column.align}
                        data-cell={cellAttr(-1, c)}
                        tabIndex={tabStop(-1, c)}
                        aria-keyshortcuts={keys}
                        onClick={(event) =>
                          setSortList(nextSorts(sortList, column.key, multiSort && event.shiftKey))
                        }
                      >
                        {column.header}
                        {ranked && rank >= 0 && (
                          <span className="cy-visually-hidden">{text.sortRank(rank + 1)}</span>
                        )}
                      </SortButton>
                    ) : (
                      <span className="cy-data-grid-label cy-reset">{column.header}</span>
                    )}
                    {columnMenu && (
                      <Menu
                        label={text.columnMenu(name)}
                        items={menuItems(column)}
                        open={menuFor === column.key}
                        onOpenChange={(open) => setMenuFor(open ? column.key : null)}
                        onSelect={(value) => runMenu(column.key, value)}
                        trigger={(props) => (
                          <IconButton
                            {...props}
                            icon={moreVertical}
                            label={text.columnMenu(name)}
                            variant="ghost"
                            size="xs"
                            tabIndex={-1}
                            wrapperClassName="cy-data-grid-menu"
                            // Focus coming back from the menu goes on to the header: the grid's keys act from there.
                            onFocus={() => {
                              if (menuOpen.current !== null) return;
                              const at = colsRef.current.findIndex((k) => k.key === column.key);
                              if (at >= 0) go(-1, at);
                            }}
                          />
                        )}
                      />
                    )}
                    {column.resizable && (
                      <span className="cy-data-grid-resize cy-reset" data-col={c} aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>
            {filterRow && (
              <div role="row" aria-rowindex={2} className="cy-data-grid-filter-row cy-reset">
                {colsWin.indices.map((c) => {
                  const column = columns[c] as DataGridColumn<Row>;
                  return (
                    <div
                      key={column.key}
                      role="gridcell"
                      aria-colindex={c + 1}
                      className="cy-data-grid-filter cy-reset"
                      style={place(c)}
                    >
                      {column.filter && (
                        <TextField
                          label={text.filter(nameOf(column))}
                          labelHidden
                          size="xs"
                          placeholder={text.filterPlaceholder}
                          value={filterText[column.key] ?? ""}
                          inputMode={column.filter === "number" ? "decimal" : undefined}
                          className="cy-data-grid-filter-field"
                          onChange={(query) => setFilterText({ ...filterText, [column.key]: query })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div role="rowgroup" className="cy-data-grid-body cy-reset" style={{ blockSize: rowsWin.total }}>
            {shown.length === 0 ? (
              <div role="row" aria-rowindex={headRows + 1} className="cy-data-grid-empty-row cy-reset">
                <div role="gridcell" aria-colspan={columns.length} className="cy-data-grid-empty cy-reset">
                  {text.empty}
                </div>
              </div>
            ) : (
              rowsWin.indices.flatMap((r) => {
                const row = shown[r] as Row;
                const id = ids[r] as string;
                const rowChosen = selectionMode === "row" ? chosenSet.has(id) : undefined;
                const open = openSet.has(id);
                const index = r + headRows + 1 + panelsBefore(r);
                const offset = rowsWin.offsetOf(r);
                const line = (
                  <div
                    key={id}
                    role="row"
                    aria-rowindex={index}
                    aria-selected={rowChosen}
                    className="cy-data-grid-row cy-reset"
                    style={{ insetBlockStart: offset }}
                  >
                    {colsWin.indices.map((c) => {
                      const column = columns[c] as DataGridColumn<Row>;
                      const inBox = box
                        ? r >= box.top && r <= box.bottom && c >= box.start && c <= box.end
                        : false;
                      if (isDetails(column))
                        return (
                          <div
                            key={column.key}
                            role="gridcell"
                            aria-colindex={c + 1}
                            aria-label={open ? text.hideDetails : text.showDetails}
                            aria-expanded={open}
                            data-cell={cellAttr(r, c)}
                            data-open={open ? "" : undefined}
                            tabIndex={tabStop(r, c)}
                            className="cy-data-grid-cell cy-data-grid-toggle cy-reset"
                            style={place(c)}
                          >
                            <Icon icon={chevronRight} size="sm" flipRtl className="cy-data-grid-chevron" />
                          </div>
                        );
                      const isEditing = editingAt.row === r && editingAt.col === c;
                      const content = isEditing
                        ? editor(column)
                        : column.cell
                          ? column.cell(row)
                          : asText(rawValue(row, column));
                      const tip = isEditing ? undefined : column.tooltip?.(row);
                      const cell = (
                        <div
                          key={column.key}
                          role="gridcell"
                          aria-colindex={c + 1}
                          aria-selected={
                            selectionMode === "cell" || selectionMode === "range" ? inBox : undefined
                          }
                          data-cell={cellAttr(r, c)}
                          data-align={column.align}
                          data-kind={column.cellKind?.(row)}
                          data-tone={column.cellTone?.(row)}
                          data-editing={isEditing ? "" : undefined}
                          tabIndex={tabStop(r, c)}
                          className="cy-data-grid-cell cy-reset"
                          style={place(c)}
                        >
                          {isEditing ? (
                            content
                          ) : (
                            <span className="cy-data-grid-value cy-reset">{content}</span>
                          )}
                        </div>
                      );
                      return tip === null || tip === undefined || tip === "" ? (
                        cell
                      ) : (
                        <Tooltip
                          key={column.key}
                          content={tip}
                          whenTruncated={cellValue}
                          className="cy-data-grid-tip"
                        >
                          {cell}
                        </Tooltip>
                      );
                    })}
                  </div>
                );
                if (!open || !renderRowDetails) return [line];
                return [
                  line,
                  <div
                    key={`${id}-details`}
                    role="row"
                    aria-rowindex={index + 1}
                    data-row-id={id}
                    className="cy-data-grid-details-row cy-reset"
                    style={{
                      insetBlockStart: offset + (rowBase || rowsWin.rowSize),
                      insetInlineStart: colsWin.view.top,
                      inlineSize: colsWin.view.height || undefined,
                    }}
                  >
                    <div
                      role="gridcell"
                      aria-colspan={columns.length}
                      className="cy-data-grid-details cy-reset"
                    >
                      {renderRowDetails(row)}
                    </div>
                  </div>,
                ];
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
  // biome-ignore-end lint/a11y/useFocusableInteractive: see above
  // biome-ignore-end lint/a11y/useSemanticElements: see above
}
