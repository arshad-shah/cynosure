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

/**
 * `rows` sorted by several keys in priority order (a new array): the first key decides, the next breaks its ties,
 * and so on. Each key compares as `sortRows` does; `get(row, key)` reads a key's value. Keys `get` cannot read (a
 * column that is gone) are skipped by the caller.
 */
export function sortRowsBy<Row>(
  rows: readonly Row[],
  sorts: readonly TableSort[],
  get: (row: Row, key: string) => unknown,
): Row[] {
  // Array sort is stable: sorting by the last key first leaves each earlier key to break the later ones' ties.
  let out = [...rows];
  for (let i = sorts.length - 1; i >= 0; i--) {
    const { key, direction } = sorts[i] as TableSort;
    out = sortRows(out, (row) => get(row, key), direction);
  }
  return out;
}

/**
 * What pressing column `key`'s header does to a list of sorts. Alone (`add` false): that column only, cycling as
 * `nextSort` from its place as the first key. Added (Shift): appended ascending, or turned descending, or removed.
 */
export function nextSorts(current: readonly TableSort[], key: string, add: boolean): TableSort[] {
  if (!add) {
    const next = nextSort(current[0]?.key === key ? (current[0] as TableSort) : null, key);
    return next ? [next] : [];
  }
  const at = current.findIndex((s) => s.key === key);
  if (at < 0) return [...current, { key, direction: "ascending" }];
  if (current[at]?.direction === "ascending")
    return current.map((s, i) => (i === at ? { key, direction: "descending" } : s));
  return current.filter((_, i) => i !== at);
}
