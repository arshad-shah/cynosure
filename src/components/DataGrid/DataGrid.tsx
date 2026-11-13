import {
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { useDrag } from "../../foundations/drag.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { isComposing, stepKey } from "../../foundations/keys.js";
import { clamp } from "../../foundations/math.js";
import { nextSort, sortRows, type TableSort } from "../../foundations/sort.js";
import { useVirtualWindow } from "../../foundations/virtual-window.js";
import { arrowDown } from "../../icons/arrow-down.js";
import { arrowUp } from "../../icons/arrow-up.js";
import { chevronsUpDown } from "../../icons/chevrons-up-down.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

/** The value inside a cell: its tooltip shows only while this is cut short. */
const cellValue = (cell: HTMLElement) => cell.querySelector<HTMLElement>(".cy-data-grid-value");

export interface DataGridTokens {
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
  /** Text colour of cells whose `cellTone` is "null" (an empty value). */
  nullColor: string;
  /** Text colour of cells whose `cellTone` is "number". */
  numberColor: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    dataGrid: DataGridTokens;
  }
}

export type { SortDirection, TableSort } from "../../foundations/sort.js";

/** How a cell's text is coloured: an empty value, a number, or a tone. */
export type DataGridCellTone = "null" | "number" | "accent" | "danger" | "success" | "warning" | "info";

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
  /** Colours the cell's text: "null" for an empty value, "number" for numbers, or a tone. */
  cellTone?: (row: Row) => DataGridCellTone | undefined;
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
  /** Called when a column's width has been changed by dragging its edge or by Alt+Left/Right, with the new width. */
  onColumnResize?: ((key: string, width: number) => void) | undefined;
  /**
   * What clicking, Space and the arrow keys select: "none" (default), "row" (rows: Ctrl/Cmd+click toggles,
   * Shift+click and Shift+arrows extend), "cell" (one cell, following focus) or "range" (a rectangle of cells:
   * Shift+click and Shift+arrows extend it). Ctrl/Cmd+C copies the selection as tab-separated text.
   */
  selectionMode?: "none" | "row" | "cell" | "range";
  /** Ids of the selected rows, with `selectionMode="row"` (controlled). */
  selectedRows?: string[] | undefined;
  /** Ids of the rows selected at the start when uncontrolled. */
  defaultSelectedRows?: string[];
  /** Called with the selected row ids when they change. */
  onSelectedRowsChange?: ((ids: string[]) => void) | undefined;
  /** The selected cells, with `selectionMode` "cell" or "range" (controlled); `null` is none. */
  selectedRange?: DataGridRange | null | undefined;
  /** The cells selected at the start when uncontrolled. */
  defaultSelectedRange?: DataGridRange | null;
  /** Called with the selected cells when they change. */
  onSelectedRangeChange?: ((range: DataGridRange | null) => void) | undefined;
  /** A row's cell was clicked or tapped. */
  onRowClick?: ((row: Row, index: number) => void) | undefined;
  /** Enter on a row's cell, or a double-click on it (open the row). */
  onRowActivate?: ((row: Row, index: number) => void) | undefined;
  /**
   * Called once the last rows come into view, once per row count: load the next rows and append them ("load more").
   * For pages, put a `Pagination` under the grid and pass it one page of rows.
   */
  onEndReached?: (() => void) | undefined;
  /** Row height and text size: "sm" is dense. Default "md". */
  size?: "sm" | "md";
  /** Replace the built-in English text: the message when there are no rows. */
  labels?: Partial<DataGridLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only (e.g. `blockSize`). Restyle through --cy-data-grid-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: DataGridLabels = { empty: "Nothing to show" };
const DEFAULT_WIDTH = 160;
const DEFAULT_MIN = 48;
/** Keyboard resizing: an arrow moves the edge this far, Shift+arrow `RESIZE_BIG`. */
const RESIZE_STEP = 8;
const RESIZE_BIG = 64;

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
 * fifty columns stay quick), a sticky header, sorting, resizable columns, row, cell or range selection copied as
 * tab-separated text, and the APG grid keyboard. Read-only: cells show what `cell` renders.
 */
export function DataGrid<Row>({
  label,
  columns,
  rows,
  getRowId,
  sort,
  defaultSort = null,
  onSortChange,
  manualSort = false,
  onColumnResize,
  selectionMode = "none",
  selectedRows,
  defaultSelectedRows = [],
  onSelectedRowsChange,
  selectedRange,
  defaultSelectedRange = null,
  onSelectedRangeChange,
  onRowClick,
  onRowActivate,
  onEndReached,
  size = "md",
  labels,
  className,
  style,
}: DataGridProps<Row>) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const [currentSort, setSort] = useControllableState<TableSort | null>(sort, defaultSort, onSortChange);
  const [chosenRows, setChosenRows] = useControllableState(
    selectedRows,
    defaultSelectedRows,
    onSelectedRowsChange,
  );
  const [range, setRange] = useControllableState<DataGridRange | null>(
    selectedRange,
    defaultSelectedRange,
    onSelectedRangeChange,
  );

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

  // Work over every row happens once per change of the rows or the sort, never per scroll.
  const shown = useMemo(() => {
    if (manualSort || !currentSort) return rows;
    const column = columns.find((c) => c.key === currentSort.key);
    return column ? sortRows(rows, (row) => rawValue(row, column), currentSort.direction) : rows;
  }, [rows, columns, currentSort, manualSort]);
  const ids = useMemo(() => shown.map(getRowId), [shown, getRowId]);
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

  // The cell with the tab stop: row -1 is the header.
  const [active, setActive] = useState({ row: 0, col: 0 });
  const activeRow = clamp(active.row, -1, shown.length - 1);
  const activeCol = clamp(active.col, 0, columns.length - 1);
  const moveFocus = useRef(false);
  /** Where Shift+click and Shift+arrows extend from, in row mode. */
  const rowAnchor = useRef<string | null>(null);

  const [headerSize, setHeaderSize] = useState(0);
  const rowsWin = useVirtualWindow(root, {
    count: shown.length,
    rowSelector: ".cy-data-grid-row",
    keep: activeRow,
    inset: headerSize,
    overscan: 4,
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
    const lines: string[] = [];
    for (let r = r0; r <= r1; r++) {
      if (only && !only.has(ids[r] as string)) continue;
      const row = shown[r] as Row;
      lines.push(
        columns
          .slice(c0, c1 + 1)
          .map((c) => tsvField(rawValue(row, c)))
          .join("\t"),
      );
    }
    return lines.join("\n");
  };
  const onCopy = (event: ClipboardEvent<HTMLDivElement>) => {
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

  /** The cell an event came from, as display indices. */
  const cellOf = (target: EventTarget) => {
    const el = (target as HTMLElement).closest?.<HTMLElement>("[data-cell]");
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
          onRowActivate?.(shown[row] as Row, row);
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

  const sortIcon = (key: string) =>
    currentSort?.key !== key ? chevronsUpDown : currentSort.direction === "ascending" ? arrowUp : arrowDown;
  const tabStop = (row: number, col: number) => (row === activeRow && col === activeCol ? 0 : -1);
  const place = (col: number): CSSProperties => ({
    insetInlineStart: colsWin.offsetOf(col),
    inlineSize: colsWin.sizeOf(col),
  });
  const multi = selectionMode === "row" || selectionMode === "range";

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
        aria-rowcount={shown.length + 1}
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
          if (at && at.row >= 0) onRowActivate?.(shown[at.row] as Row, at.row);
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
                const sorted = currentSort?.key === column.key ? currentSort.direction : undefined;
                const keys = column.resizable ? "Alt+ArrowLeft Alt+ArrowRight" : undefined;
                return (
                  <div
                    key={column.key}
                    role="columnheader"
                    aria-colindex={c + 1}
                    aria-sort={column.sortable ? (sorted ?? "none") : undefined}
                    className="cy-data-grid-header cy-reset"
                    data-align={column.align}
                    data-sortable={column.sortable ? "" : undefined}
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
                      <ButtonBase
                        className="cy-data-grid-sort cy-reset"
                        data-cell={cellAttr(-1, c)}
                        tabIndex={tabStop(-1, c)}
                        aria-keyshortcuts={keys}
                        onClick={() => setSort(nextSort(currentSort, column.key))}
                      >
                        <span className="cy-data-grid-label cy-reset">{column.header}</span>
                        <Icon icon={sortIcon(column.key)} size="sm" className="cy-data-grid-sort-icon" />
                      </ButtonBase>
                    ) : (
                      <span className="cy-data-grid-label cy-reset">{column.header}</span>
                    )}
                    {column.resizable && (
                      <span className="cy-data-grid-resize cy-reset" data-col={c} aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div role="rowgroup" className="cy-data-grid-body cy-reset" style={{ blockSize: rowsWin.total }}>
            {shown.length === 0 ? (
              <div role="row" aria-rowindex={2} className="cy-data-grid-empty-row cy-reset">
                <div role="gridcell" aria-colspan={columns.length} className="cy-data-grid-empty cy-reset">
                  {text.empty}
                </div>
              </div>
            ) : (
              rowsWin.indices.map((r) => {
                const row = shown[r] as Row;
                const id = ids[r] as string;
                const rowChosen = selectionMode === "row" ? chosenSet.has(id) : undefined;
                return (
                  <div
                    key={id}
                    role="row"
                    aria-rowindex={r + 2}
                    aria-selected={rowChosen}
                    className="cy-data-grid-row cy-reset"
                    style={{ insetBlockStart: rowsWin.offsetOf(r) }}
                  >
                    {colsWin.indices.map((c) => {
                      const column = columns[c] as DataGridColumn<Row>;
                      const inBox = box
                        ? r >= box.top && r <= box.bottom && c >= box.start && c <= box.end
                        : false;
                      const content = column.cell ? column.cell(row) : asText(rawValue(row, column));
                      const tip = column.tooltip?.(row);
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
                          data-tone={column.cellTone?.(row)}
                          tabIndex={tabStop(r, c)}
                          className="cy-data-grid-cell cy-reset"
                          style={place(c)}
                        >
                          <span className="cy-data-grid-value cy-reset">{content}</span>
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
