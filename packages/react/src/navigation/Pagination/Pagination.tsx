import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, EllipsisIcon } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  Children,
  type HTMLAttributes,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { cn } from '../../utils/cn.js';
import { paginationRange } from '../shared/paginationRange.js';
import type { NavSize } from '../shared/types.js';
import {
  paginationButton,
  paginationEllipsis,
  paginationList,
  paginationRoot,
  paginationSize,
} from './Pagination.css.js';

export interface PaginationContextValue {
  totalPages: number;
  currentPage: number;
  goTo: (page: number) => void;
  size: NavSize;
  siblingCount: number;
  boundaryCount: number;
  showFirstLast: boolean;
  disabled: boolean;
  pageLabel: (page: number) => string;
  labels: Required<PaginationLabels>;
}

export interface PaginationLabels {
  previous?: string;
  next?: string;
  first?: string;
  last?: string;
  page?: (page: number) => string;
  current?: (page: number) => string;
}

const DEFAULT_LABELS: Required<PaginationLabels> = {
  previous: 'Previous page',
  next: 'Next page',
  first: 'First page',
  last: 'Last page',
  page: (page) => `Go to page ${page}`,
  current: (page) => `Page ${page}, current page`,
};

const PaginationContext = createContext<PaginationContextValue | null>(null);

const usePaginationContext = (): PaginationContextValue => {
  const ctx = useContext(PaginationContext);
  if (!ctx) throw new Error('Pagination subcomponents must be used inside <Pagination>');
  return ctx;
};

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  size?: NavSize;
  siblingCount?: number;
  boundaryCount?: number;
  showFirstLast?: boolean;
  disabled?: boolean;
  labels?: PaginationLabels;
  /** Custom children compose their own layout; omit for the prop-driven mode. */
  children?: ReactNode;
  /** `aria-label` on the wrapping `<nav>`. */
  'aria-label'?: string;
}

/**
 * Supports two call styles:
 *   - **Prop-driven** (default): omit `children`, we render Prev / page list / Next.
 *   - **Compound**: pass `<PaginationPrevious>`, `<PaginationPages>`, `<PaginationNext>`
 *     as children for full control.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    totalPages,
    currentPage,
    onPageChange,
    size = 'md',
    siblingCount = 1,
    boundaryCount = 1,
    showFirstLast = false,
    disabled = false,
    labels,
    children,
    className,
    'aria-label': ariaLabel = 'Pagination',
    ...rest
  },
  ref,
) {
  const mergedLabels = useMemo<Required<PaginationLabels>>(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  const goTo = useCallback(
    (page: number) => {
      if (disabled) return;
      const clamped = Math.min(Math.max(1, page), Math.max(1, totalPages));
      if (clamped === currentPage) return;
      onPageChange(clamped);
    },
    [onPageChange, currentPage, totalPages, disabled],
  );

  const ctx: PaginationContextValue = {
    totalPages,
    currentPage,
    goTo,
    size,
    siblingCount,
    boundaryCount,
    showFirstLast,
    disabled,
    labels: mergedLabels,
    pageLabel: (page) =>
      page === currentPage ? mergedLabels.current(page) : mergedLabels.page(page),
  };

  const hasCustomChildren = Children.count(children) > 0;

  return (
    <PaginationContext.Provider value={ctx}>
      <nav ref={ref} aria-label={ariaLabel} className={cn(paginationRoot, className)} {...rest}>
        <ul className={paginationList}>
          {hasCustomChildren ? (
            children
          ) : (
            <>
              {showFirstLast ? <PaginationFirst /> : null}
              <PaginationPrevious />
              <PaginationPages />
              <PaginationNext />
              {showFirstLast ? <PaginationLast /> : null}
            </>
          )}
        </ul>
      </nav>
    </PaginationContext.Provider>
  );
});

// ---------------------------------------------------------------------------
// Compound parts
// ---------------------------------------------------------------------------

interface PaginationButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-current' | 'onClick'> {
  active?: boolean;
}

const PaginationPageButton = forwardRef<
  HTMLButtonElement,
  PaginationButtonProps & { page: number }
>(function PaginationPageButton({ active, page, className, children, ...rest }, ref) {
  const ctx = usePaginationContext();
  return (
    <button
      ref={ref}
      type="button"
      aria-label={ctx.pageLabel(page)}
      aria-current={active ? 'page' : undefined}
      disabled={ctx.disabled}
      className={cn(paginationButton, paginationSize[ctx.size], className)}
      onClick={() => ctx.goTo(page)}
      {...rest}
    >
      {children ?? page}
    </button>
  );
});
export interface PaginationPreviousProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {}

export const PaginationPrevious = forwardRef<HTMLButtonElement, PaginationPreviousProps>(
  function PaginationPrevious({ className, children, disabled, ...rest }, ref) {
    const ctx = usePaginationContext();
    const isDisabled = disabled || ctx.disabled || ctx.currentPage <= 1;
    return (
      <li>
        <button
          ref={ref}
          type="button"
          aria-label={ctx.labels.previous}
          disabled={isDisabled}
          className={cn(paginationButton, paginationSize[ctx.size], className)}
          onClick={() => ctx.goTo(ctx.currentPage - 1)}
          {...rest}
        >
          {children ?? <ChevronLeft />}
        </button>
      </li>
    );
  },
);

export interface PaginationNextProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {}

export const PaginationNext = forwardRef<HTMLButtonElement, PaginationNextProps>(
  function PaginationNext({ className, children, disabled, ...rest }, ref) {
    const ctx = usePaginationContext();
    const isDisabled = disabled || ctx.disabled || ctx.currentPage >= ctx.totalPages;
    return (
      <li>
        <button
          ref={ref}
          type="button"
          aria-label={ctx.labels.next}
          disabled={isDisabled}
          className={cn(paginationButton, paginationSize[ctx.size], className)}
          onClick={() => ctx.goTo(ctx.currentPage + 1)}
          {...rest}
        >
          {children ?? <ChevronRight />}
        </button>
      </li>
    );
  },
);

export const PaginationFirst = forwardRef<HTMLButtonElement, PaginationPreviousProps>(
  function PaginationFirst({ className, children, disabled, ...rest }, ref) {
    const ctx = usePaginationContext();
    const isDisabled = disabled || ctx.disabled || ctx.currentPage <= 1;
    return (
      <li>
        <button
          ref={ref}
          type="button"
          aria-label={ctx.labels.first}
          disabled={isDisabled}
          className={cn(paginationButton, paginationSize[ctx.size], className)}
          onClick={() => ctx.goTo(1)}
          {...rest}
        >
          {children ?? <ChevronsLeft />}
        </button>
      </li>
    );
  },
);

export const PaginationLast = forwardRef<HTMLButtonElement, PaginationNextProps>(
  function PaginationLast({ className, children, disabled, ...rest }, ref) {
    const ctx = usePaginationContext();
    const isDisabled = disabled || ctx.disabled || ctx.currentPage >= ctx.totalPages;
    return (
      <li>
        <button
          ref={ref}
          type="button"
          aria-label={ctx.labels.last}
          disabled={isDisabled}
          className={cn(paginationButton, paginationSize[ctx.size], className)}
          onClick={() => ctx.goTo(ctx.totalPages)}
          {...rest}
        >
          {children ?? <ChevronsRight />}
        </button>
      </li>
    );
  },
);

export interface PaginationPagesProps extends HTMLAttributes<HTMLElement> {}

export const PaginationPages = forwardRef<HTMLElement, PaginationPagesProps>(
  function PaginationPages(_props, _ref) {
    const ctx = usePaginationContext();
    const range = paginationRange({
      totalPages: ctx.totalPages,
      currentPage: ctx.currentPage,
      siblingCount: ctx.siblingCount,
      boundaryCount: ctx.boundaryCount,
    });

    return (
      <>
        {range.map((item) => {
          if (item === 'ellipsis-start' || item === 'ellipsis-end') {
            return (
              <li key={item} aria-hidden="true" className={paginationEllipsis}>
                <EllipsisIcon size={16} />
              </li>
            );
          }
          return (
            <li key={item}>
              <PaginationPageButton page={item} active={item === ctx.currentPage} />
            </li>
          );
        })}
      </>
    );
  },
);

/** Alias kept for parity with the spec example. */
export const PaginationItem = PaginationPageButton;
