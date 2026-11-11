import { type KeyboardEvent as ReactKeyboardEvent, useRef } from "react";

/**
 * The next usable index from `from` in direction `step` (±1), skipping unusable ones; `wrap` goes round the ends. When
 * there is none, `from` if it is usable, else -1. `from` may be -1 or `count` to start from an end.
 */
export function seekEnabled(
  count: number,
  from: number,
  step: 1 | -1,
  usable: (index: number) => boolean,
  wrap = false,
): number {
  for (let n = 1; n <= count; n++) {
    let i = from + step * n;
    if (wrap) i = ((i % count) + count) % count;
    else if (i < 0 || i >= count) break;
    if (usable(i)) return i;
  }
  return from >= 0 && from < count && usable(from) ? from : -1;
}

/** A printable key with no Ctrl, Command or Alt: a letter typed to jump to an item. Space is not one (it selects). */
export const isTypeaheadKey = (event: KeyboardEvent | ReactKeyboardEvent) =>
  event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey;

/**
 * Type-ahead (WAI-ARIA APG listbox, menu, tree): returns a function that takes a typed key and the item labels
 * (`null` for an item that cannot be reached) and gives the index to move to, or -1. Keys typed within half a second
 * build a word; a single letter starts after `from`, so pressing it again cycles through the items it begins.
 */
export function useTypeahead() {
  const typed = useRef({ text: "", at: 0 });
  return (key: string, labels: readonly (string | null)[], from: number): number => {
    const now = Date.now();
    typed.current = { text: now - typed.current.at > 500 ? key : typed.current.text + key, at: now };
    const find = (query: string) => {
      const q = query.toLowerCase();
      const start = Math.max(from, 0) + (q.length === 1 ? 1 : 0);
      for (let n = 0; n < labels.length; n++) {
        const i = (start + n) % labels.length;
        if (labels[i]?.toLowerCase().startsWith(q)) return i;
      }
      return -1;
    };
    const word = find(typed.current.text);
    // A word that matches nothing ("aa" where only one item starts with "a") falls back to cycling on the key.
    return word >= 0 ? word : find(key);
  };
}
