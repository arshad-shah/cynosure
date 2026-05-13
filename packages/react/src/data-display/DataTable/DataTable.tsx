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

/** Pagination configuration passed to {@link DataTableProps.pagination}. */
export interface DataTablePagination {
  /**
   * Initial number of rows per page.
   * @default 20
   */
  pageSize?: number;
  /**
   * Initial zero-based page index.
   * @default 0
   */
  pageIndex?: number;
  /** Fires whenever the user changes page or page size. */
  onChange?: (state: { pageIndex: number; pageSize: number }) => void;
}

/** Global filter (search) configuration passed to {@link DataTableProps.filter}. */
export interface DataTableFilter {
  /** Current filter value applied across all column accessors. */
  global?: string;
  /** Fires with the next filter value when the user types into the bound search input. */
  onGlobalFilterChange?: (value: string) => void;
}

/**
 * Props for {@link DataTable}. `TData` is the row type; column accessors and
 * cell renderers are typed against it via `@tanstack/react-table`'s ColumnDef.
 */
export interface DataTableProps<TData> extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Row data. Each row is rendered once unless paginated; identity tracked by `getRowId`. */
  data: TData[];
  /**
   * Column definitions from `@tanstack/react-table`. Each `ColumnDef` provides
   * an `accessorKey`/`accessorFn` that yields the cell value, a `header`, and
   * an optional `cell` renderer. When `selectable` is true an internal
   * `__select` column is prepended automatically.
   */
  columns: ColumnDef<TData>[];
  /**
   * Enable click-to-sort on each column that hasn't opted out. Holding shift
   * while clicking adds a secondary sort. Sorted columns expose
   * `aria-sort="ascending|descending|none"` for assistive tech.
   * @default false
   */
  sortable?: boolean;
  /**
   * Enable a leading checkbox column for row selection. Header checkbox
   * toggles the entire visible page.
   * @default false
   */
  selectable?: boolean;
  /** Fires with the live array of selected rows whenever selection changes. */
  onSelectionChange?: (rows: TData[]) => void;
  /**
   * `true` enables pagination with defaults; pass a {@link DataTablePagination}
   * to customise page size, initial index, or wire an external change
   * listener. When enabled, the pagination footer renders below the table.
   */
  pagination?: boolean | DataTablePagination;
  /** Controlled global filter — leave undefined to disable filtering. */
  filter?: DataTableFilter;
  /**
   * Body rendered when `data.length === 0` (after filters applied).
   * @default "No results."
   */
  emptyState?: ReactNode;
  /**
   * Render skeleton rows instead of data. Useful while waiting on async data.
   * @default false
   */
  loading?: boolean;
  /**
   * Number of skeleton rows shown while `loading` is true.
   * @default 6
   */
  loadingRows?: number;
  /**
   * Visual variant forwarded to the underlying {@link Table}.
   * @default "line"
   */
  tableVariant?: TableVariant;
  /**
   * Size token forwarded to the underlying {@link Table}.
   * @default "md"
   */
  tableSize?: TableSize;
  /** Pin the table header to the scroll container's top edge while body scrolls. */
  stickyHeader?: boolean;
  /** Optional toolbar rendered above the table (e.g. the search input). */
  toolbar?: ReactNode;
  /** Custom row identifier — used as the React key and the selection map key. */
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

/**
 * DataTable is a fully-featured tabular view built on `@tanstack/react-table`
 * and the Cynosure {@link Table} primitives. Column accessors are typed
 * against `TData`; cells render via TanStack's `flexRender`. Sorting is
 * toggle-on-click (with shift-click for multi-sort) and surfaces
 * `aria-sort` per header. Selection adds a leading checkbox column and a
 * page-level toggle in the header. Filtering uses TanStack's global filter
 * row model; pagination uses TanStack's pagination row model and renders the
 * cynosure {@link Pagination} control in the footer. Loading shows
 * deterministic-width Skeleton rows (stable across SSR/CSR). Note: the body
 * is rendered eagerly — there is no virtualisation, so very large datasets
 * should be paginated or sliced before being passed in.
 */
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
