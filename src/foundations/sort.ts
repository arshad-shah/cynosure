export type SortDirection = "ascending" | "descending";

/** A column sort: which column, which way. Table and DataGrid share it. */
export interface TableSort {
  key: string;
  direction: SortDirection;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const empty = (v: unknown) => v === null || v === undefined || v === "";

/**
 * `rows` sorted by `get(row)` (a new array): numbers as numbers, everything else in the locale's order with numbers
 * inside text compared as numbers; empty values (null, undefined, "") last in either direction.
 */
export function sortRows<Row>(
  rows: readonly Row[],
  get: (row: Row) => unknown,
  direction: SortDirection,
): Row[] {
  const sign = direction === "ascending" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = get(a);
    const y = get(b);
    const xEmpty = empty(x);
    if (xEmpty || empty(y)) return xEmpty === empty(y) ? 0 : xEmpty ? 1 : -1;
    const by =
      typeof x === "number" && typeof y === "number" ? x - y : collator.compare(String(x), String(y));
    return by * sign;
  });
}

/** What pressing column `key`'s header does: ascending, then descending, then unsorted. */
export function nextSort(current: TableSort | null, key: string): TableSort | null {
  if (current?.key !== key) return { key, direction: "ascending" };
  return current.direction === "ascending" ? { key, direction: "descending" } : null;
}
