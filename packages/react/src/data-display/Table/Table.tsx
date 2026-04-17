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

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  variant?: TableVariant;
  size?: TableSize;
  stickyHeader?: boolean;
  layout?: TableLayout;
}

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

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}
export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
  { className, ...rest },
  ref,
) {
  return <thead ref={ref} className={cn(tableHead, className)} {...rest} />;
});

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, ...rest },
  ref,
) {
  return <tbody ref={ref} className={cn(tableBody, className)} {...rest} />;
});

export interface TableFootProps extends HTMLAttributes<HTMLTableSectionElement> {}
export const TableFoot = forwardRef<HTMLTableSectionElement, TableFootProps>(function TableFoot(
  { className, ...rest },
  ref,
) {
  return <tfoot ref={ref} className={cn(tableFoot, className)} {...rest} />;
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, ...rest },
  ref,
) {
  return <tr ref={ref} className={cn(tableRow, className)} {...rest} />;
});

export interface TableHeaderProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: TableAlign;
}
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

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: TableAlign;
  numeric?: boolean;
}
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

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {}
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, ...rest }, ref) {
    return <caption ref={ref} className={cn(tableCaption, className)} {...rest} />;
  },
);
