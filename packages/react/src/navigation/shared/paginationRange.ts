export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

export interface PaginationRangeInput {
  totalPages: number;
  currentPage: number;
  /** Pages adjacent to currentPage on each side. Default 1. */
  siblingCount?: number;
  /** Pages pinned to each boundary (start / end). Default 1. */
  boundaryCount?: number;
}

const range = (start: number, end: number): number[] => {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
};

/**
 * Produces the visible page buttons for a paginator.
 *
 * Always keeps `boundaryCount` pages pinned to each end and `siblingCount`
 * pages on either side of `currentPage`. Gaps of more than one page become
 * `'ellipsis-start'` / `'ellipsis-end'` markers so callers can key them
 * stably; screen readers get two distinct hidden indicators when the range
 * produces two separate gaps.
 *
 * The algorithm mirrors the one used by MUI's `usePagination` so the output
 * stays stable as the current page moves through the range — near the
 * boundaries the sibling window expands to keep the visible count roughly
 * constant.
 */
export function paginationRange({
  totalPages,
  currentPage,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationRangeInput): PaginationItem[] {
  if (totalPages <= 0) return [];

  const count = Math.floor(totalPages);
  const page = Math.min(Math.max(1, Math.floor(currentPage)), count);
  const sib = Math.max(0, Math.floor(siblingCount));
  const bound = Math.max(0, Math.floor(boundaryCount));

  const startPages = range(1, Math.min(bound, count));
  const endPages = range(Math.max(count - bound + 1, bound + 1), count);

  const siblingsStart = Math.max(
    Math.min(
      // Lower edge of the sibling window.
      page - sib,
      // Keep the window away from the right boundary.
      count - bound - sib * 2 - 1,
    ),
    bound + 2,
  );

  const siblingsEnd = Math.min(
    Math.max(
      page + sib,
      // Keep the window away from the left boundary.
      bound + sib * 2 + 2,
    ),
    endPages.length > 0 ? (endPages[0] as number) - 2 : count - 1,
  );

  const items: PaginationItem[] = [
    ...startPages,
    ...(siblingsStart > bound + 2
      ? (['ellipsis-start'] as const)
      : bound + 1 < count - bound
        ? [bound + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - bound - 1
      ? (['ellipsis-end'] as const)
      : count - bound > bound
        ? [count - bound]
        : []),
    ...endPages,
  ];

  return items;
}
