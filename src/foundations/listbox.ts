import { type KeyboardEvent as ReactKeyboardEvent, type RefObject, useEffect, useRef, useState } from "react";

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
 * build a word; a single letter starts after `from`, so pressing it again cycles through the items it begins. With
 * nothing active (`from` -1) the search starts at the first item.
 */
export function useTypeahead() {
  const typed = useRef({ text: "", at: 0 });
  return (key: string, labels: readonly (string | null)[], from: number): number => {
    const now = Date.now();
    typed.current = { text: now - typed.current.at > 500 ? key : typed.current.text + key, at: now };
    const find = (query: string) => {
      const q = query.toLowerCase();
      const start = from < 0 ? 0 : from + (q.length === 1 ? 1 : 0);
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

const everyOption = () => true;
const NONE = Symbol("none");
const FOOTER = Symbol("footer");

export interface ActiveOptionOptions {
  /** The list's id. Option `i` has the id `${id}-${i}`, the target of the field's `aria-activedescendant`. */
  id: string;
  /** The list element: the active option is scrolled into view in it. */
  list: RefObject<HTMLElement | null>;
  /** The list is shown: only then is there an active option to name and to scroll to. */
  open: boolean;
  /** How many options. */
  count: number;
  /**
   * A footer action after the options, at index `count`: the arrow keys' and `last()`'s final stop, but never made
   * active on its own (when the list changes, or by `first()`).
   */
  footer?: boolean | undefined;
  /** Whether option `i` can be active (it is not disabled). Default: every option. */
  usable?: ((index: number) => boolean) | undefined;
  /** The arrow keys go round the ends. Default: they stop at the first and the last option. */
  wrap?: boolean | undefined;
  /** An option's identity, so the active option is followed when the list changes. Default: its position. */
  keyOf?: ((index: number) => unknown) | undefined;
}

/**
 * The active option of a list that a field points into with `aria-activedescendant` (focus stays in the field):
 * Select, Combobox, TagInput, TextArea's mentions and CommandPalette. It holds the active index, moves it with the
 * arrow keys (stopping at the ends unless `wrap`), scrolls it into view, and names it `${id}-${index}`. When the list
 * changes, the active option stays if it is still there (by `keyOf`), else the first usable one becomes active; with
 * no usable option, `active` is -1.
 */
export function useActiveOption({
  id,
  list,
  open,
  count,
  footer = false,
  usable = everyOption,
  wrap = false,
  keyOf,
}: ActiveOptionOptions) {
  const total = footer ? count + 1 : count;
  const stop = (index: number) => (index === count ? footer : usable(index));
  const keyAt = (index: number) => (index === count ? FOOTER : keyOf ? keyOf(index) : index);
  const [chosen, setChosen] = useState<unknown>(NONE);
  const first = () => seekEnabled(count, -1, 1, usable);
  const last = () => seekEnabled(total, total, -1, stop);
  let active = -1;
  if (chosen !== NONE)
    for (let i = 0; i < total && active < 0; i++) if (keyAt(i) === chosen && stop(i)) active = i;
  if (active < 0) active = first();
  const optionId = (index: number) => `${id}-${index}`;
  const setActive = (index: number) => setChosen(index < 0 ? NONE : keyAt(index));
  // An option given way to (gone, or now disabled) is forgotten: it does not take over again if it comes back.
  const shown = active < 0 ? NONE : keyAt(active);
  useEffect(() => {
    if (chosen !== NONE && shown !== chosen) setChosen(shown);
  });
  useEffect(() => {
    if (open && active >= 0)
      list.current?.querySelector(`[id="${id}-${active}"]`)?.scrollIntoView?.({ block: "nearest" });
  }, [open, active, list, id]);
  return {
    /** The active option's index, or -1. */
    active,
    /** The active option's id while the list is open: the field's `aria-activedescendant`. */
    activeId: open && active >= 0 ? optionId(active) : undefined,
    /** Option `index`'s id. */
    optionId,
    /** Makes option `index` active (-1: none, so the first usable one is). */
    setActive,
    /** The first usable option's index, or -1. */
    first,
    /** The last usable option's index, or -1. */
    last,
    /** Makes the next usable option active (1) or the one before (-1). */
    move: (step: 1 | -1) => {
      const next = seekEnabled(total, active >= 0 ? active : step > 0 ? -1 : total, step, stop, wrap);
      if (next >= 0) setActive(next);
    },
  };
}
