/**
 * Search text matching, ignoring case: what a filter keeps and what HighlightedText marks follow the same rule, so a
 * kept row always shows its match. A query is trimmed; case is folded by a Unicode regular expression, which keeps
 * indices in the text itself (lower-casing can change a string's length).
 */

const literal = (term: string) => term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The last query's expression, kept: a filter asks the same query of every item.
let last: { query: string; find: RegExp } | null = null;
const finder = (query: string) => {
  if (last?.query !== query) last = { query, find: new RegExp(literal(query), "iu") };
  return last.find;
};

/** Where `text` first contains `query` (trimmed), ignoring case, or -1. An empty query is found at 0. */
export function textMatchAt(text: string, query: string): number {
  return query.trim() === "" ? 0 : text.search(finder(query));
}

/** Whether `text` contains `query` (trimmed), ignoring case. An empty query matches every text. */
export function textMatches(text: string, query: string): boolean {
  return textMatchAt(text, query) >= 0;
}

/** Every occurrence of `query` (trimmed) in `text`, ignoring case, as `[start, end)` pairs. An empty query has none. */
export function textMatchRanges(text: string, query: string): [number, number][] {
  if (query.trim() === "") return [];
  return [...text.matchAll(new RegExp(literal(query), "giu"))].map((m) => [m.index, m.index + m[0].length]);
}
