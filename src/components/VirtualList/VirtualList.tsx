import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { useDrag } from "../../foundations/drag.js";
import { seekEnabled } from "../../foundations/listbox.js";
import { clamp } from "../../foundations/math.js";
import { moveItems } from "../../foundations/reorder.js";
import { useFollow } from "../../foundations/use-follow.js";
import { useVirtualWindow } from "../../foundations/virtual-window.js";
import { OverlayFrame } from "../OverlayFrame/OverlayFrame.js";

export interface VirtualListTokens {
  /** Height of the list (it scrolls inside). */
  height: string;
  /** Minimum row height. */
  rowHeight: string;
  /** Background of the chosen rows. */
  selectedBackground: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    virtualList: VirtualListTokens;
  }
}

export interface VirtualItemState {
  index: number;
  selected: boolean;
  disabled: boolean;
}

/** What `handle` gives you: scroll a row into view from outside (a search hit, a "jump to latest" button). */
export interface VirtualListHandle {
  /** Scrolls row `index` into view: `nearest` (default, the least scrolling), `start` or `center`. */
  scrollToIndex: (index: number, align?: "nearest" | "start" | "center") => void;
  /** Scrolls to the last row. */
  scrollToEnd: () => void;
}

export interface VirtualListProps<T> {
  /** Accessible name of the list. */
  label: string;
  /** The data, one entry per row. */
  items: readonly T[];
  /** A stable, unique key per item. */
  getKey: (item: T, index: number) => string;
  /** The content of one row. Rows share one height unless `wrap` is set. */
  renderItem: (item: T, state: VirtualItemState) => ReactNode;
  /** Rows wrap their text and take the height they need (log lines, messages); each is measured as it renders. */
  wrap?: boolean;
  /** Keep the end in view as rows are added, while the list is scrolled to the end (a log, a live feed). */
  follow?: boolean;
  /**
   * Called with false when the view leaves the end of the list and true when it is back, from scrolling or from rows
   * arriving past it. It starts true. Use it to show a "jump to latest" control in `overlay`.
   */
  onAtBottomChange?: ((atBottom: boolean) => void) | undefined;
  /**
   * Content pinned over the list at the bottom centre that does not scroll: a "3 new" pill, a "jump to latest" button.
   * It is outside the listbox.
   */
  overlay?: ReactNode;
  /**
   * Rows that head a section (a date, a group). They cannot be focused or selected, and the current section's heading
   * stays pinned at the top while its rows scroll under it.
   */
  isHeader?: (item: T) => boolean;
  /** `scrollToIndex` and `scrollToEnd`, for scrolling from outside the list. */
  handle?: Ref<VirtualListHandle>;
  /** Return true for rows that cannot be selected; the arrow keys skip them. */
  isDisabled?: (item: T) => boolean;
  /** "none" (a list to act on), "single" (default) or "multiple". */
  selectionMode?: "none" | "single" | "multiple";
  /** Keys of the selected rows (controlled). */
  selectedKeys?: string[] | undefined;
  /** Keys of the rows selected at the start when uncontrolled. */
  defaultSelectedKeys?: string[];
  /** Called with the selected keys when the selection changes. */
  onSelectionChange?: ((keys: string[]) => void) | undefined;
  /** Enter on a row, a double-click, or a click when nothing is selectable. */
  onAction?: ((item: T, index: number) => void) | undefined;
  /**
   * Reordering: Alt+Up/Down moves the selection (or the focused row), and so does dragging it with a mouse or pen.
   * `keys` are the rows moved, in order; `to` is where the first of them lands in the new order. `moveItems` applies it.
   */
  onMove?: ((keys: string[], to: number) => void) | undefined;
  /** Shown when there are no items. */
  empty?: ReactNode;
  /** Replace the built-in English text: the announcement after a move. */
  labels?: Partial<VirtualListLabels>;
  /** Row height and text size. Default "md". */
  size?: "sm" | "md";
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only (e.g. `blockSize`). Restyle through --cy-virtual-list-* tokens. */
  style?: CSSProperties;
}

export interface VirtualListLabels {
  /** Announced after a move. Default "Moved to position 5 of 120" or "Moved 3 rows to position 5 of 120". */
  moved: (count: number, position: number, total: number) => string;
}

const DEFAULT_LABELS: VirtualListLabels = {
  moved: (count, position, total) =>
    count === 1
      ? `Moved to position ${position} of ${total}`
      : `Moved ${count} rows to position ${position} of ${total}`,
};

export { moveItems };

/**
 * A long list (thousands of rows) that renders only the rows in view: logs, file lists, search results. An APG listbox
 * with one tab stop; the focused row is always rendered, so focus survives scrolling.
 */
export function VirtualList<T>({
  label,
  items,
  getKey,
  renderItem,
  isDisabled,
  selectionMode = "single",
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  onAction,
  onMove,
  wrap = false,
  follow = false,
  onAtBottomChange,
  overlay,
  isHeader,
  handle,
  empty,
  labels,
  size = "md",
  className,
  style,
}: VirtualListProps<T>) {
  const root = useRef<HTMLDivElement>(null);
  const [picked, choose] = useControllableState(selectedKeys, defaultSelectedKeys, onSelectionChange);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const moveFocus = useRef(false);
  const anchor = useRef<number | null>(null);
  const text = { ...DEFAULT_LABELS, ...labels };
  const [said, setSaid] = useState("");
  /** While dragging: the rows moved and the gap they would drop into (0 to the row count). */
  const [drag, setDragState] = useState<{ block: string[]; gap: number } | null>(null);
  const dragRef = useRef(drag);
  const setDrag = (next: typeof drag) => {
    dragRef.current = next;
    setDragState(next);
  };

  // Work over the whole list happens once per change of the items or the selection, never per scroll: keys, where
  // each key is, and the chosen keys as a Set (so nothing below scans a list per row).
  const keys = useMemo(() => items.map((item, i) => getKey(item, i)), [items, getKey]);
  const indexOf = useMemo(() => new Map(keys.map((k, i) => [k, i])), [keys]);
  const pickedSet = useMemo(() => new Set(picked), [picked]);
  const header = (i: number) => !!isHeader?.(items[i] as T);
  const off = (i: number) => !!isDisabled?.(items[i] as T) || header(i);
  const { firstEnabled, pickedIndex } = useMemo(() => {
    const usable = (i: number) => !isDisabled?.(items[i] as T) && !isHeader?.(items[i] as T);
    return {
      firstEnabled: keys.findIndex((_, i) => usable(i)),
      pickedIndex: keys.findIndex((k, i) => pickedSet.has(k) && usable(i)),
    };
  }, [keys, items, isDisabled, isHeader, pickedSet]);
  const focusIndex = focusKey === null ? -1 : (indexOf.get(focusKey) ?? -1);
  const stop = focusIndex >= 0 ? focusIndex : pickedIndex >= 0 ? pickedIndex : firstEnabled;

  // Wrapped rows are measured by a ResizeObserver as they render (and again when they change size, say when the list
  // narrows); rows not yet seen are guessed at the height of one line. Scrolling reads no heights.
  const [measured, setMeasured] = useState<ReadonlyMap<string, number>>(() => new Map());
  const [line, setLine] = useState(0);
  const sizes = useMemo(
    () => (wrap && line ? keys.map((k) => measured.get(k) ?? line) : undefined),
    [wrap, line, keys, measured],
  );
  const win = useVirtualWindow(root, {
    count: items.length,
    rowSelector: ".cy-virtual-list-row",
    keep: stop,
    ...(sizes ? { sizes } : {}),
  });
  const keysRef = useRef(keys);
  keysRef.current = keys;
  const sizer = useRef<{ observer: ResizeObserver; seen: Set<Element> } | null>(null);
  useClientLayoutEffect(() => {
    if (!wrap) return;
    const observer = new ResizeObserver((entries) => {
      const sized: [string, number][] = [];
      for (const { target } of entries) {
        const key = keysRef.current[Number((target as HTMLElement).dataset.index)];
        const h = (target as HTMLElement).offsetHeight;
        if (h && key !== undefined) sized.push([key, h]);
      }
      if (!sized.length) return;
      setMeasured((measured) => {
        const changed = sized.filter(([key, h]) => measured.get(key) !== h);
        return changed.length ? new Map([...measured, ...changed]) : measured;
      });
      // One line: the smallest row first seen, so unseen rows are never guessed taller than they can be.
      const least = Math.min(...sized.map(([, h]) => h));
      setLine((l) => l || least);
    });
    sizer.current = { observer, seen: new Set() };
    return () => {
      observer.disconnect();
      sizer.current = null;
    };
  }, [wrap]);
  // Observe the rows new to the DOM and let go of the ones that left; observing reads nothing (the observer measures
  // after layout).
  useClientLayoutEffect(() => {
    const s = sizer.current;
    if (!s) return;
    const rows = new Set<Element>(root.current?.querySelectorAll(".cy-virtual-list-row") ?? []);
    for (const row of s.seen)
      if (!rows.has(row)) {
        s.observer.unobserve(row);
        s.seen.delete(row);
      }
    for (const row of rows)
      if (!s.seen.has(row)) {
        s.observer.observe(row);
        s.seen.add(row);
      }
  });
  const top = (i: number) => (sizes ? win.offsetOf(i) : i * win.rowSize);
  /** The gap (0 to the row count) nearest to `y`, in content pixels: the first row whose middle is below it. */
  const gapAt = (y: number) => {
    if (!sizes) return clamp(Math.round(y / win.rowSize), 0, keys.length);
    let lo = 0;
    let hi = keys.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (top(mid) + win.sizeOf(mid) / 2 < y) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  // Following: while the list sits at its end, new rows keep it there.
  const following = useFollow(root, { follow, onAtBottomChange });
  useClientLayoutEffect(() => following.contentChanged(), [items.length, win.total]);
  useImperativeHandle(handle, () => ({
    scrollToEnd: following.scrollToEnd,
    scrollToIndex: (index, align = "nearest") => {
      const el = root.current;
      const i = clamp(index, 0, keys.length - 1);
      if (!el) return;
      if (align === "nearest") win.reveal(i);
      else el.scrollTop = align === "start" ? top(i) : top(i) + win.sizeOf(i) / 2 - el.clientHeight / 2;
    },
  }));

  // The heading pinned at the top: the last header at or above the first row in view.
  let pinned = -1;
  if (isHeader) {
    const first = win.indices.length
      ? Math.min(...win.indices.filter((i) => top(i) + win.sizeOf(i) > win.view.top))
      : -1;
    for (let i = Math.min(first, keys.length - 1); i >= 0; i--)
      if (header(i)) {
        pinned = i;
        break;
      }
  }

  useClientLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    win.reveal(stop);
    root.current?.querySelector<HTMLElement>(`[data-index="${stop}"]`)?.focus({ preventScroll: true });
  });

  const toggle = (i: number) => {
    const key = keys[i] as string;
    if (selectionMode === "single") choose([key]);
    else if (selectionMode === "multiple")
      choose(pickedSet.has(key) ? picked.filter((k) => k !== key) : [...picked, key]);
  };
  const go = (i: number) => {
    setFocusKey(keys[i] as string);
    moveFocus.current = true;
  };
  /** The next enabled row from `from` in direction `step`, or `from` itself when there is none. */
  const seek = (from: number, step: 1 | -1) => {
    const i = seekEnabled(keys.length, from, step, (n) => !off(n));
    return i < 0 ? from : i;
  };
  /** Row `i` (clamped), or the nearest enabled row to it, looking in direction `step` first. */
  const near = (i: number, step: 1 | -1) => {
    const at = clamp(i, 0, keys.length - 1);
    if (!off(at)) return at;
    const ahead = seek(at, step);
    return ahead !== at ? ahead : seek(at, step === 1 ? -1 : 1);
  };

  /** What moves from row `i`: the selection if `i` is in it, else row `i` alone. Disabled rows stay. */
  const blockFrom = (i: number) =>
    pickedSet.has(keys[i] as string)
      ? keys.filter((k, n) => pickedSet.has(k) && !off(n))
      : [keys[i] as string];
  /** Moves `block` so its first row lands at `to` among the rows that stay, and announces it. */
  const move = (block: string[], to: number) => {
    const at = clamp(to, 0, keys.length - block.length);
    const next = moveItems(keys, block, at, (k) => k);
    if (next.every((k, n) => k === keys[n])) return;
    onMove?.(block, at);
    setSaid(text.moved(block.length, at + 1, keys.length));
    moveFocus.current = true;
  };
  /** How many rows before row `end` stay put when `block` moves. */
  const staying = (end: number, block: string[]) => {
    const moving = new Set(block);
    return keys.slice(0, end).filter((k) => !moving.has(k)).length;
  };
  /** The rows being dragged, for a quick look-up per rendered row. */
  const dragging = useMemo(() => (drag ? new Set(drag.block) : null), [drag?.block]);

  // Dragging the selection with a mouse or pen. A finger scrolls the list instead.
  useDrag(root, {
    distance: 4,
    touchAction: "css",
    onStart: ({ pointerType, path }) => {
      if (!onMove || pointerType === "touch") return false;
      // The row pressed, from the press's own path (the current event is a move on the window).
      const row = path.find(
        (n): n is HTMLElement => n instanceof HTMLElement && n.classList.contains("cy-virtual-list-row"),
      );
      const i = row ? Number(row.dataset.index) : -1;
      if (i < 0 || off(i)) return false;
      setDrag({ block: blockFrom(i), gap: i });
    },
    onMove: ({ point }) => {
      const el = root.current as HTMLDivElement;
      const box = el.getBoundingClientRect();
      // Near an edge, scroll toward it so a drop far away is reachable.
      if (point.y < box.top + win.rowSize) el.scrollTop -= win.rowSize / 2;
      else if (point.y > box.bottom - win.rowSize) el.scrollTop += win.rowSize / 2;
      const gap = gapAt(point.y - box.top + el.scrollTop);
      setDrag({ ...(dragRef.current as { block: string[]; gap: number }), gap });
    },
    onEnd: (_, cancelled) => {
      const d = dragRef.current as { block: string[]; gap: number };
      setDrag(null);
      if (cancelled) return;
      move(d.block, staying(d.gap, d.block));
    },
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (onMove && event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      if (off(stop)) return;
      const block = blockFrom(stop);
      move(
        block,
        staying(indexOf.get(block[0] as string) as number, block) + (event.key === "ArrowUp" ? -1 : 1),
      );
      return;
    }
    const page = Math.max(1, Math.floor((root.current as HTMLDivElement).clientHeight / win.rowSize) - 1);
    const multi = selectionMode === "multiple";
    let target: number | null = null;
    switch (event.key) {
      case "ArrowDown":
        target = seek(stop, 1);
        break;
      case "ArrowUp":
        target = seek(stop, -1);
        break;
      case "PageDown":
        target = near(stop + page, 1);
        break;
      case "PageUp":
        target = near(stop - page, -1);
        break;
      case "Home":
        target = near(0, 1);
        break;
      case "End":
        target = near(keys.length - 1, -1);
        break;
      case " ":
        event.preventDefault();
        if (!off(stop)) toggle(stop);
        anchor.current = stop;
        return;
      case "Enter":
        event.preventDefault();
        if (off(stop)) return;
        if (onAction) onAction(items[stop] as T, stop);
        else toggle(stop);
        return;
      case "a":
        if (multi && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          choose(keys.filter((_, i) => !off(i)));
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    if (multi && event.shiftKey && target !== stop && !off(target)) {
      // Shift+arrows extend the selection from where it was anchored.
      const from = anchor.current ?? stop;
      const lo = Math.min(from, target);
      const hi = Math.max(from, target);
      const range = keys.filter((_, i) => i >= lo && i <= hi && !off(i));
      const inRange = new Set(range);
      choose([...picked.filter((k) => !inRange.has(k)), ...range]);
      anchor.current = from;
    } else anchor.current = target;
    go(target);
  };

  const onRowClick = (i: number) => {
    setFocusKey(keys[i] as string);
    anchor.current = i;
    if (off(i)) return;
    if (selectionMode === "none") onAction?.(items[i] as T, i);
    else toggle(i);
  };

  const rootClass = className ? `cy-virtual-list ${className}` : "cy-virtual-list";
  // The overlay stays put while the list scrolls under it. The frame is always there: one that came and went with the
  // overlay would remount the list and lose its scroll position.
  const framed = (list: ReactNode) => <OverlayFrame overlay={overlay}>{list}</OverlayFrame>;
  // An empty listbox is invalid ARIA: with no items the list is just its message.
  if (items.length === 0)
    return framed(
      <div ref={root} className={rootClass} data-size={size} style={style}>
        <div className="cy-virtual-list-empty cy-reset">{empty}</div>
      </div>,
    );
  return (
    <>
      {framed(
        <div
          ref={root}
          role="listbox"
          aria-label={label}
          aria-multiselectable={selectionMode === "multiple" || undefined}
          className={rootClass}
          data-size={size}
          data-wrap={wrap ? "" : undefined}
          style={style}
          onKeyDown={onKeyDown}
          onScroll={(e) => {
            following.onScroll();
            win.onScroll(e.currentTarget.scrollTop);
          }}
        >
          {pinned >= 0 && win.view.top > top(pinned) && (
            <div className="cy-virtual-list-pinned cy-reset" aria-hidden="true">
              {renderItem(items[pinned] as T, { index: pinned, selected: false, disabled: true })}
            </div>
          )}
          <div
            className="cy-virtual-list-space cy-reset"
            style={{ blockSize: win.total }}
            aria-hidden="true"
          />
          {drag && (
            <div
              className="cy-virtual-list-drop cy-reset"
              style={{ insetBlockStart: drag.gap < keys.length ? top(drag.gap) : win.total }}
              aria-hidden="true"
            />
          )}
          {win.indices.map((i) => {
            const key = keys[i] as string;
            const disabled = off(i);
            const selected = selectionMode !== "none" && pickedSet.has(key);
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: the listbox handles keys for every row (roving focus)
              <div
                key={key}
                role="option"
                data-index={i}
                aria-selected={selectionMode === "none" ? undefined : selected}
                aria-disabled={disabled || undefined}
                aria-posinset={i + 1}
                aria-setsize={items.length}
                tabIndex={i === stop ? 0 : -1}
                className="cy-virtual-list-row cy-reset"
                data-moving={dragging?.has(key) ? "" : undefined}
                data-header={header(i) ? "" : undefined}
                style={{ insetBlockStart: top(i) }}
                onClick={() => onRowClick(i)}
                // Focus can arrive without our keys (a screen reader, a script): keys then act from here.
                onFocus={() => focusKey !== key && setFocusKey(key)}
                onDoubleClick={() => !disabled && selectionMode !== "none" && onAction?.(items[i] as T, i)}
              >
                {renderItem(items[i] as T, { index: i, selected, disabled })}
              </div>
            );
          })}
        </div>,
      )}
      {onMove && (
        <span className="cy-visually-hidden" role="status">
          {said}
        </span>
      )}
    </>
  );
}
