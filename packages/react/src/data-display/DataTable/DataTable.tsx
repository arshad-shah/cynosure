import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDownUpIcon, SortAsc, SortDesc } from 'lucide-react';
import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Checkbox } from '../../forms/Checkbox/Checkbox.js';
import { Pagination } from '../../navigation/Pagination/Pagination.js';
import { cn } from '../../utils/cn.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table/Table.js';
import type { TableSize, TableVariant } from '../Table/Table.js';
import {
  dataTableScroll,
  dataTableSurface,
  dataTableToolbar,
  dataTableWrap,
  emptyCell,
  paginationFooter,
  selectionSummary,
  sortIcon,
  sortableHeader,
} from './DataTable.css.js';

export type { ColumnDef } from '@tanstack/react-table';

export interface DataTablePagination {
  pageSize?: number;
  pageIndex?: number;
  onChange?: (state: { pageIndex: number; pageSize: number }) => void;
}

export interface DataTableFilter {
  global?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export interface DataTableProps<TData> extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  data: TData[];
  columns: ColumnDef<TData>[];
  sortable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (rows: TData[]) => void;
  pagination?: boolean | DataTablePagination;
  filter?: DataTableFilter;
  /** Body rendered when `data.length === 0` (after filters applied). */
  emptyState?: ReactNode;
  loading?: boolean;
  loadingRows?: number;
  /** Static `Table` visuals. */
  tableVariant?: TableVariant;
  tableSize?: TableSize;
  stickyHeader?: boolean;
  /** Optional toolbar rendered above the table (e.g. the search input). */
  toolbar?: ReactNode;
  getRowId?: (row: TData, index: number) => string;
  /** Caption rendered inside the `<caption>` element for screen readers. */
  caption?: ReactNode;
}

const RowCheckbox = ({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (next: boolean) => void;
  label: string;
}): ReactElement => (
  <Checkbox
    aria-label={label}
    size="sm"
    checked={indeterminate && !checked ? 'indeterminate' : checked}
    onCheckedChange={(next) => onChange(next === true)}
  />
);

function DataTableInner<TData>(
  props: DataTableProps<TData>,
  ref: React.ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    data,
    columns: userColumns,
    sortable = false,
    selectable = false,
    onSelectionChange,
    pagination,
    filter,
    emptyState,
    loading,
    loadingRows = 6,
    tableVariant = 'line',
    tableSize = 'md',
    stickyHeader,
    toolbar,
    getRowId,
    caption,
    className,
    ...rest
  } = props;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const paginationEnabled = pagination !== undefined && pagination !== false;
  const paginationConfig = typeof pagination === 'object' ? pagination : undefined;
  const initialPageSize = paginationConfig?.pageSize ?? 20;
  const initialPageIndex = paginationConfig?.pageIndex ?? 0;
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });

  const columns = useMemo<ColumnDef<TData>[]>(() => {
    if (!selectable) return userColumns;
    const selectColumn: ColumnDef<TData> = {
      id: '__select',
      enableSorting: false,
      header: ({ table }) => (
        <RowCheckbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={(next) => table.toggleAllPageRowsSelected(next)}
          label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <RowCheckbox
          checked={row.getIsSelected()}
          onChange={(next) => row.toggleSelected(next)}
          label="Select row"
        />
      ),
    };
    return [selectColumn, ...userColumns];
  }, [userColumns, selectable]);

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    setPaginationState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      paginationConfig?.onChange?.({ pageIndex: next.pageIndex, pageSize: next.pageSize });
      return next;
    });
  };

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    setRowSelection((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      ...(paginationEnabled ? { pagination: paginationState } : {}),
      ...(filter?.global !== undefined ? { globalFilter: filter.global } : {}),
    },
    enableSorting: sortable,
    enableRowSelection: selectable,
    enableMultiSort: sortable,
    onSortingChange: setSorting,
    onRowSelectionChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    ...(sortable ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(filter ? { getFilteredRowModel: getFilteredRowModel() } : {}),
    ...(paginationEnabled ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    ...(getRowId ? { getRowId } : {}),
    onGlobalFilterChange: filter?.onGlobalFilterChange,
  });

  // Fire onSelectionChange when the selection map changes (component API surface).
  // `rowSelection` is the trigger here — biome's exhaustive-deps rule thinks
  // it's redundant because `table` closes over it, but `table` is a stable ref
  // and only the selection map mutation actually warrants re-firing the callback.
  // biome-ignore lint/correctness/useExhaustiveDependencies: rowSelection is the intentional trigger; `table` is a stable ref and listing it alone would not re-fire on selection map mutation.
  useEffect(() => {
    if (!selectable || !onSelectionChange) return;
    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
    onSelectionChange(selectedRows);
  }, [rowSelection, selectable, onSelectionChange, table]);

  const rows = table.getRowModel().rows;
  const leafColumnCount = table.getVisibleLeafColumns().length || 1;

  return (
    <div ref={ref} className={cn(dataTableWrap, className)} {...rest}>
      {toolbar ? <div className={dataTableToolbar}>{toolbar}</div> : null}
      <div className={dataTableSurface}>
        <div className={dataTableScroll}>
          <Table variant={tableVariant} size={tableSize} stickyHeader={stickyHeader}>
            {caption ? <caption>{caption}</caption> : null}
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = sortable && header.column.getCanSort();
                    const sortDir = header.column.getIsSorted();
                    const ariaSort = canSort
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : sortDir === 'desc'
                          ? 'descending'
                          : 'none'
                      : undefined;
                    const content = header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext());
                    return (
                      <TableHeader key={header.id} aria-sort={ariaSort}>
                        {canSort ? (
                          <button
                            type="button"
                            className={sortableHeader}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span>{content}</span>
                            <span className={sortIcon} aria-hidden="true">
                              {sortDir === 'asc' ? (
                                <SortAsc size={'14'} />
                              ) : sortDir === 'desc' ? (
                                <SortDesc size={'14'} />
                              ) : (
                                <ArrowDownUpIcon size={'14'} />
                              )}
                            </span>
                          </button>
                        ) : (
                          content
                        )}
                      </TableHeader>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: loadingRows }).map((_, rowIdx) => (
                  <TableRow key={`skeleton-${rowIdx.toString()}`}>
                    {Array.from({ length: leafColumnCount }).map((__, colIdx) => (
                      <TableCell key={`skeleton-${rowIdx.toString()}-${colIdx.toString()}`}>
                        {/*
                         * Width derived deterministically from the cell
                         * coordinates so SSR and the first client render
                         * produce the same markup. Using `Math.random()`
                         * here would land a different value on each side of
                         * hydration and trigger a React mismatch warning
                         * plus a visible width-flash on mount.
                         */}
                        <Skeleton
                          height="1em"
                          width={`${(40 + ((rowIdx * 7 + colIdx * 13) % 40)).toString()}%`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={leafColumnCount} className={emptyCell}>
                    {emptyState ?? 'No results.'}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} data-selected={row.getIsSelected() ? 'true' : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {paginationEnabled ? (
        <div className={paginationFooter}>
          <span className={selectionSummary}>
            {selectable
              ? `${table.getSelectedRowModel().rows.length.toString()} of ${table.getFilteredRowModel().rows.length.toString()} row(s) selected`
              : `${table.getFilteredRowModel().rows.length.toString()} row(s)`}
          </span>
          <Pagination
            totalPages={Math.max(1, table.getPageCount())}
            currentPage={table.getState().pagination.pageIndex + 1}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        </div>
      ) : null}
    </div>
  );
}

export const DataTable = forwardRef(DataTableInner) as <TData>(
  props: DataTableProps<TData> & { ref?: React.Ref<HTMLDivElement> },
) => ReactElement;
