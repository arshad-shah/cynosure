import { type CSSProperties, type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { useDrag } from "../../foundations/drag.js";
import { seekEnabled } from "../../foundations/listbox.js";
import { clamp } from "../../foundations/math.js";
import { useVirtualWindow } from "../../foundations/virtual-window.js";

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

export interface VirtualListProps<T> {
  /** Accessible name of the list. */
  label: string;
  items: readonly T[];
  /** A stable, unique key per item. */
  getKey: (item: T, index: number) => string;
  /** The content of one row. Rows share one height: keep it to a line or a fixed layout. */
  renderItem: (item: T, state: VirtualItemState) => ReactNode;
  isDisabled?: (item: T) => boolean;
  /** "none" (a list to act on), "single" (default) or "multiple". */
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: string[] | undefined;
  defaultSelectedKeys?: string[];
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
  labels?: Partial<VirtualListLabels>;
  size?: "sm" | "md";
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

/** `items` with the ones keyed `keys` taken out and put back together, the first of them at `to`. */
export function moveItems<T>(
  items: readonly T[],
  keys: readonly string[],
  to: number,
  getKey: (item: T, index: number) => string,
): T[] {
  const moving = new Set(keys);
  const block = items.filter((item, i) => moving.has(getKey(item, i)));
  const rest = items.filter((item, i) => !moving.has(getKey(item, i)));
  return [...rest.slice(0, to), ...block, ...rest.slice(to)];
}

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

  const keys = items.map((item, i) => getKey(item, i));
  const off = (i: number) => !!isDisabled?.(items[i] as T);
  const firstEnabled = keys.findIndex((_, i) => !off(i));
  const focusIndex = focusKey === null ? -1 : keys.indexOf(focusKey);
  const pickedIndex = keys.findIndex((k, i) => picked.includes(k) && !off(i));
  const stop = focusIndex >= 0 ? focusIndex : pickedIndex >= 0 ? pickedIndex : firstEnabled;

  const win = useVirtualWindow(root, {
    count: items.length,
    rowSelector: ".cy-virtual-list-row",
    keep: stop,
  });

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
      choose(picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key]);
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
    picked.includes(keys[i] as string)
      ? keys.filter((k, n) => picked.includes(k) && !off(n))
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
  /** Where `block`'s first row is now, counted among the rows that stay. */
  const placeOf = (block: string[]) =>
    keys.filter((k) => !block.includes(k) && keys.indexOf(k) < keys.indexOf(block[0] as string)).length;

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
      const gap = clamp(Math.round((point.y - box.top + el.scrollTop) / win.rowSize), 0, keys.length);
      setDrag({ ...(dragRef.current as { block: string[]; gap: number }), gap });
    },
    onEnd: (_, cancelled) => {
      const d = dragRef.current as { block: string[]; gap: number };
      setDrag(null);
      if (cancelled) return;
      move(d.block, keys.slice(0, d.gap).filter((k) => !d.block.includes(k)).length);
    },
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (onMove && event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      if (off(stop)) return;
      const block = blockFrom(stop);
      move(block, placeOf(block) + (event.key === "ArrowUp" ? -1 : 1));
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
      choose([...picked.filter((k) => !range.includes(k)), ...range]);
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
  // An empty listbox is invalid ARIA: with no items the list is just its message.
  if (items.length === 0)
    return (
      <div ref={root} className={rootClass} data-size={size} style={style}>
        <div className="cy-virtual-list-empty cy-reset">{empty}</div>
      </div>
    );
  return (
    <>
      <div
        ref={root}
        role="listbox"
        aria-label={label}
        aria-multiselectable={selectionMode === "multiple" || undefined}
        className={rootClass}
        data-size={size}
        style={style}
        onKeyDown={onKeyDown}
        onScroll={(e) => win.onScroll(e.currentTarget.scrollTop)}
      >
        <div className="cy-virtual-list-space cy-reset" style={{ blockSize: win.total }} aria-hidden="true" />
        {drag && (
          <div
            className="cy-virtual-list-drop cy-reset"
            style={{ insetBlockStart: drag.gap * win.rowSize }}
            aria-hidden="true"
          />
        )}
        {win.indices.map((i) => {
          const key = keys[i] as string;
          const disabled = off(i);
          const selected = selectionMode !== "none" && picked.includes(key);
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
              data-moving={drag?.block.includes(key) ? "" : undefined}
              style={{ insetBlockStart: i * win.rowSize }}
              onClick={() => onRowClick(i)}
              // Focus can arrive without our keys (a screen reader, a script): keys then act from here.
              onFocus={() => focusKey !== key && setFocusKey(key)}
              onDoubleClick={() => !disabled && selectionMode !== "none" && onAction?.(items[i] as T, i)}
            >
              {renderItem(items[i] as T, { index: i, selected, disabled })}
            </div>
          );
        })}
      </div>
      {onMove && (
        <span className="cy-visually-hidden" role="status">
          {said}
        </span>
      )}
    </>
  );
}
