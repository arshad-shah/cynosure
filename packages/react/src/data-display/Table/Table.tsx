import {
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn.js';
import {
  tableBody,
  tableCaption,
  tableCell,
  tableFoot,
  tableHead,
  tableHeader,
  tableRoot,
  tableRow,
  tableSize,
  tableStickyHeader,
  tableVariant,
} from './Table.css.js';

export type TableVariant = 'line' | 'striped' | 'grid' | 'minimal';
export type TableSize = 'sm' | 'md' | 'lg';
export type TableAlign = 'start' | 'center' | 'end';
export type TableLayout = 'auto' | 'fixed';

/** Props for the {@link Table} root element. */
export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /**
   * Visual treatment: `line` shows row dividers, `striped` zebras alternating
   * rows, `grid` draws both row and column borders, `minimal` strips all
   * chrome.
   * @default "line"
   */
  variant?: TableVariant;
  /**
   * Density preset for padding and font size.
   * @default "md"
   */
  size?: TableSize;
  /**
   * Pin the `<thead>` to the top of the scroll container while the body
   * scrolls vertically. Requires the table to live inside a scrollable
   * ancestor for it to take effect.
   * @default false
   */
  stickyHeader?: boolean;
  /**
   * CSS `table-layout` strategy. `auto` (default) sizes columns from content;
   * `fixed` distributes width based on the first row only and is faster for
   * wide tables.
   * @default "auto"
   */
  layout?: TableLayout;
}

/**
 * Table is a low-level styled wrapper around the native HTML `<table>`
 * element and its semantic sub-parts (`thead`, `tbody`, `tfoot`, `tr`,
 * `th`, `td`, `caption`). Use directly for static / declarative tables; for
 * data-driven rendering with sorting / filtering / pagination / selection,
 * reach for {@link DataTable} instead. There is no virtualisation here —
 * every row in the JSX renders to the DOM.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { variant = 'line', size = 'md', stickyHeader = false, layout = 'auto', className, ...rest },
  ref,
) {
  return (
    <table
      ref={ref}
      data-variant={variant}
      data-layout={layout}
      className={cn(
        tableRoot,
        tableVariant[variant],
        tableSize[size],
        stickyHeader ? tableStickyHeader : undefined,
        className,
      )}
      {...rest}
    />
  );
});

/** Props for the {@link TableHead} `<thead>` section. */
export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}
/** Renders a styled `<thead>`. Holds {@link TableRow}s of {@link TableHeader}s. */
export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
  { className, ...rest },
  ref,
) {
  return <thead ref={ref} className={cn(tableHead, className)} {...rest} />;
});

/** Props for the {@link TableBody} `<tbody>` section. */
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}
/** Renders a styled `<tbody>` containing the data {@link TableRow}s. */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, ...rest },
  ref,
) {
  return <tbody ref={ref} className={cn(tableBody, className)} {...rest} />;
});

/** Props for the {@link TableFoot} `<tfoot>` section. */
export interface TableFootProps extends HTMLAttributes<HTMLTableSectionElement> {}
/** Renders a styled `<tfoot>` for totals / summary rows. */
export const TableFoot = forwardRef<HTMLTableSectionElement, TableFootProps>(function TableFoot(
  { className, ...rest },
  ref,
) {
  return <tfoot ref={ref} className={cn(tableFoot, className)} {...rest} />;
});

/** Props for the {@link TableRow} `<tr>` element. */
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}
/** Renders a styled `<tr>` row inside head/body/foot sections. */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, ...rest },
  ref,
) {
  return <tr ref={ref} className={cn(tableRow, className)} {...rest} />;
});

/** Props for the {@link TableHeader} `<th>` cell. */
export interface TableHeaderProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Horizontal text alignment, surfaced via `data-align` for the CSS to read. */
  align?: TableAlign;
}
/**
 * Header cell. Defaults `scope="col"` for accessibility; pass `scope="row"`
 * when rendering a row-header cell inside a body row.
 */
export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(function TableHeader(
  { align, scope, className, ...rest },
  ref,
) {
  return (
    <th
      ref={ref}
      scope={scope ?? 'col'}
      data-align={align}
      className={cn(tableHeader, className)}
      {...rest}
    />
  );
});

/** Props for the {@link TableCell} `<td>` data cell. */
export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Horizontal text alignment, surfaced via `data-align` for the CSS to read. */
  align?: TableAlign;
  /**
   * Shortcut for numeric cells — sets `data-numeric="true"` (enables tabular
   * numerals) and defaults `align` to `end` when no explicit value is set.
   */
  numeric?: boolean;
}
/**
 * Data cell. Pair with `numeric` for right-aligned tabular numerals or pass
 * `align` directly for custom horizontal alignment.
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align, numeric, className, ...rest },
  ref,
) {
  return (
    <td
      ref={ref}
      data-align={align ?? (numeric ? 'end' : undefined)}
      data-numeric={numeric ? 'true' : undefined}
      className={cn(tableCell, className)}
      {...rest}
    />
  );
});

/** Props for the {@link TableCaption} `<caption>` element used as the table's accessible name. */
export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {}
/** Renders a styled `<caption>`. Should be the first child of {@link Table}. */
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, ...rest }, ref) {
    return <caption ref={ref} className={cn(tableCaption, className)} {...rest} />;
  },
);
