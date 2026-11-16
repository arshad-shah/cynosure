import {
  type CSSProperties,
  createContext,
  forwardRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
  useContext,
  useId,
  useMemo,
} from "react";
import type { RootAttributes } from "../../foundations/attributes.js";
import { useControllableState } from "../../foundations/controllable.js";
import { nextSort, type SortDirection, sortRows, type TableSort } from "../../foundations/sort.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { SortButton } from "../SortButton/SortButton.js";

export interface TableTokens {
  /** Background of the header row. */
  headerBackground: string;
  /** Background of selected rows. */
  selectedBackground: string;
  /** Tallest the table gets before its body scrolls (with `stickyHeader`). */
  maxHeight: string;
  /** How much of the tone a tinted cell (`tone`) mixes into the surface. Default 14%. */
  tintMix: string;
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
  /**
   * Tints the column: a tone tints its header and every cell; a function of the row tints cell by cell (a heat grid of
   * working hours), returning a tone or nothing. A tint is not read out: say the same in the cell's text.
   */
  tone?: Tone | ((row: Row) => Tone | undefined) | undefined;
}

export interface TableLabels {
  /** Name of a row's checkbox. Default: "Select row" plus the row header's text when it is a string. */
  selectRow: (rowName: string) => string;
  selectAll: string;
  /** Shown when there are no rows. */
  empty: ReactNode;
}

/** What both forms of Table take: the frame around the rows. */
export interface TableFrameProps extends RootAttributes {
  /** The table's caption: its accessible name, shown above it unless `captionHidden`. */
  caption: ReactNode;
  /** Hides the caption visually; it still names the table. */
  captionHidden?: boolean;
  /** The header stays visible while the body scrolls inside the table. */
  stickyHeader?: boolean;
  /** Cell padding and text size. Default "md". */
  size?: Size;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-table-* tokens. */
  style?: CSSProperties;
}

/**
 * The compound form: rows written as markup (`TableHead`, `TableBody`, `TableFoot`, `TableRow`, `TableHeaderCell`,
 * `TableCell`), with the data-driven table's look.
 */
export interface TableStaticProps extends TableFrameProps {
  /** `TableHead`, `TableBody` and `TableFoot`, in that order. */
  children: ReactNode;
  /** Only in the data-driven form. */
  columns?: never;
  /** Only in the data-driven form. */
  rows?: never;
}

export interface TableProps<Row> extends TableFrameProps {
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
  /** Replace the built-in English text: the checkbox names and the empty message. */
  labels?: Partial<TableLabels>;
}

const DEFAULT_LABELS: TableLabels = {
  selectRow: (name) => (name ? `Select ${name}` : "Select row"),
  selectAll: "Select all rows",
  empty: "Nothing to show",
};

const cellValue = <Row,>(row: Row, key: string) => (row as Record<string, unknown>)[key];

/** Inside a Table, and which of its parts: the head, the body or the foot. */
type Section = "table" | "head" | "body" | "foot";
const SectionContext = createContext<Section | null>(null);
const useSection = (part: string, allowed: Section[], inside: string) => {
  const section = useContext(SectionContext);
  if (!section || !allowed.includes(section)) throw new Error(`<${part}> must be inside ${inside}`);
  return section;
};

/** The wrapper, the scroll region and the `<table>` with its caption, shared by both forms. */
function TableFrame({
  caption,
  captionHidden = false,
  stickyHeader = false,
  size = "md",
  className,
  style,
  children,
  frameRef,
  ...rest
}: TableFrameProps & { children: ReactNode; frameRef?: Ref<HTMLDivElement> | undefined }) {
  const id = useId();
  return (
    <div
      ref={frameRef}
      {...rest}
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
          <SectionContext.Provider value="table">{children}</SectionContext.Provider>
        </table>
      </div>
    </div>
  );
}

/** Table's two call signatures: the compound form, and the data-driven form for any row type. */
export interface TableComponent {
  (props: TableStaticProps & RefAttributes<HTMLDivElement>): ReactElement;
  <Row>(props: TableProps<Row> & RefAttributes<HTMLDivElement>): ReactElement;
}

/**
 * Rows of data with headers: sortable columns, optional row selection, and a sticky header. A semantic `<table>`, so
 * screen readers announce headers with every cell. Give it `columns` and `rows`, or write the rows as markup with
 * `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell` (the compound form, same look).
 * The ref is the root element (the wrapper with the border, which scrolls).
 */
export const Table = forwardRef<HTMLDivElement, TableProps<unknown> | TableStaticProps>(
  function Table(props, ref) {
    if (props.columns) return <DataTable {...(props as TableProps<unknown>)} frameRef={ref} />;
    const { children, ...frame } = props as TableStaticProps;
    return (
      <TableFrame {...frame} frameRef={ref}>
        {children}
      </TableFrame>
    );
  },
) as unknown as TableComponent;

function DataTable<Row>({
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
  frameRef,
  ...rest
}: TableProps<Row> & { frameRef?: Ref<HTMLDivElement> | undefined }) {
  const text = { ...DEFAULT_LABELS, ...labels };
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
    <TableFrame
      {...rest}
      frameRef={frameRef}
      caption={caption}
      captionHidden={captionHidden}
      stickyHeader={stickyHeader}
      size={size}
      {...(className ? { className } : {})}
      {...(style ? { style } : {})}
    >
      <thead className="cy-reset">
        <tr className="cy-reset">
          {selectable && (
            <th scope="col" className="cy-table-th cy-table-select cy-reset">
              <Checkbox
                label={text.selectAll}
                labelHidden
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
                data-tone={typeof column.tone === "string" ? column.tone : undefined}
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
                      label={text.selectRow(rowName(row))}
                      labelHidden
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
                  const content = column.cell ? column.cell(row) : (cellValue(row, column.key) as ReactNode);
                  const tone = typeof column.tone === "function" ? column.tone(row) : column.tone;
                  return column === headerColumn ? (
                    <th
                      key={column.key}
                      scope="row"
                      className="cy-table-td cy-table-rowheader cy-reset"
                      data-align={column.align}
                      data-tone={tone}
                    >
                      {content}
                    </th>
                  ) : (
                    <td
                      key={column.key}
                      className="cy-table-td cy-reset"
                      data-align={column.align}
                      data-tone={tone}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </TableFrame>
  );
}

/** Spread on every part of the compound form. */
interface TablePartProps extends RootAttributes {
  /** Added to the element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** The part's content. */
  children?: ReactNode;
}

export type TableHeadProps = TablePartProps;
export type TableBodyProps = TablePartProps;
export type TableFootProps = TablePartProps;

const cx = (base: string, className?: string) => (className ? `${base} ${className}` : base);

/** The compound form's header rows (`<thead>`): its header cells are column headers. */
export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
  { className, children, ...rest },
  ref,
) {
  useSection("TableHead", ["table"], "<Table>");
  return (
    <thead ref={ref} {...rest} className={cx("cy-reset", className)}>
      <SectionContext.Provider value="head">{children}</SectionContext.Provider>
    </thead>
  );
});

/** The compound form's body rows (`<tbody>`): a header cell in a row names that row. */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, children, ...rest },
  ref,
) {
  useSection("TableBody", ["table"], "<Table>");
  return (
    <tbody ref={ref} {...rest} className={cx("cy-reset", className)}>
      <SectionContext.Provider value="body">{children}</SectionContext.Provider>
    </tbody>
  );
});

/** The compound form's footer rows (`<tfoot>`), such as totals, set apart by a line above them. */
export const TableFoot = forwardRef<HTMLTableSectionElement, TableFootProps>(function TableFoot(
  { className, children, ...rest },
  ref,
) {
  useSection("TableFoot", ["table"], "<Table>");
  return (
    <tfoot ref={ref} {...rest} className={cx("cy-table-foot cy-reset", className)}>
      <SectionContext.Provider value="foot">{children}</SectionContext.Provider>
    </tfoot>
  );
});

export interface TableRowProps extends TablePartProps {
  /** A selected row takes `--cy-table-selected-background`. Body rows only. */
  selected?: boolean | undefined;
}

const SECTIONS = "<TableHead>, <TableBody> or <TableFoot>";

/** One row of the compound form (`<tr>`). */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, className, children, ...rest },
  ref,
) {
  const section = useSection("TableRow", ["head", "body", "foot"], SECTIONS);
  return (
    <tr
      ref={ref}
      {...rest}
      className={cx(section === "head" ? "cy-reset" : "cy-table-row cy-reset", className)}
      data-selected={selected && section === "body" ? "" : undefined}
    >
      {children}
    </tr>
  );
});

/** What both kinds of cell take. */
interface TableCellBase extends TablePartProps {
  /** `end` for numbers. */
  align?: "start" | "end" | undefined;
  /** Columns the cell spans. */
  colSpan?: number | undefined;
  /** Rows the cell spans. */
  rowSpan?: number | undefined;
  /** Tints the cell in a tone (a heat grid, a highlighted column). Not read out: say the same in its text. */
  tone?: Tone | undefined;
}

export interface TableHeaderCellProps extends TableCellBase {
  /** Any CSS width for the column (header cells in the head). */
  width?: string | undefined;
  /**
   * What the header names. Default: `col` in the head (a column header), `row` in the body and foot (the cell names
   * its row, and screen readers announce it with each cell).
   */
  scope?: "col" | "row" | "colgroup" | "rowgroup" | undefined;
  /** The column's current sort, shown on its sort button and as `aria-sort`. With `onSort`, default "none". */
  sort?: SortDirection | "none" | undefined;
  /** Makes the header a sort button (a SortButton); called when it is pressed. You sort the rows. */
  onSort?: (() => void) | undefined;
}

/** A header cell (`<th>`): a column header in the head, a row header in the body or foot. */
export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell(
    { align, width, scope, sort, onSort, tone, className, style, children, ...rest },
    ref,
  ) {
    const section = useSection("TableHeaderCell", ["head", "body", "foot"], SECTIONS);
    const head = section === "head";
    const sortable = onSort !== undefined || sort !== undefined;
    const direction = sort === "none" ? undefined : sort;
    return (
      <th
        ref={ref}
        {...rest}
        scope={scope ?? (head ? "col" : "row")}
        className={cx(head ? "cy-table-th cy-reset" : "cy-table-td cy-table-rowheader cy-reset", className)}
        data-align={align}
        data-tone={tone}
        aria-sort={sortable ? (direction ?? "none") : undefined}
        style={width ? { inlineSize: width, ...style } : style}
      >
        {onSort ? (
          <SortButton direction={direction} align={align} onClick={onSort}>
            {children}
          </SortButton>
        ) : (
          children
        )}
      </th>
    );
  },
);

export type TableCellProps = TableCellBase;

/** A data cell (`<td>`) of the compound form. */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align, tone, className, children, ...rest },
  ref,
) {
  const section = useSection("TableCell", ["head", "body", "foot"], SECTIONS);
  return (
    <td
      ref={ref}
      {...rest}
      className={cx(section === "head" ? "cy-table-th cy-reset" : "cy-table-td cy-reset", className)}
      data-align={align}
      data-tone={tone}
    >
      {children}
    </td>
  );
});
