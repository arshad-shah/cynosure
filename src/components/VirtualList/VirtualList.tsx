import { type CSSProperties, type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
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
  /** Shown when there are no items. */
  empty?: ReactNode;
  size?: "sm" | "md";
  className?: string;
  /** Layout only (e.g. `blockSize`). Restyle through --cy-virtual-list-* tokens. */
  style?: CSSProperties;
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
  empty,
  size = "md",
  className,
  style,
}: VirtualListProps<T>) {
  const root = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState(defaultSelectedKeys);
  const picked = selectedKeys ?? own;
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const moveFocus = useRef(false);
  const anchor = useRef<number | null>(null);

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

  const choose = (next: string[]) => {
    if (selectedKeys === undefined) setOwn(next);
    onSelectionChange?.(next);
  };
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
    for (let i = from + step; i >= 0 && i < keys.length; i += step) if (!off(i)) return i;
    return from;
  };
  /** Row `i` (clamped), or the nearest enabled row to it, looking in direction `step` first. */
  const near = (i: number, step: 1 | -1) => {
    const at = Math.min(keys.length - 1, Math.max(0, i));
    if (!off(at)) return at;
    const ahead = seek(at, step);
    return ahead !== at ? ahead : seek(at, step === 1 ? -1 : 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
            style={{ insetBlockStart: i * win.rowSize }}
            onClick={() => onRowClick(i)}
            onDoubleClick={() => !disabled && selectionMode !== "none" && onAction?.(items[i] as T, i)}
          >
            {renderItem(items[i] as T, { index: i, selected, disabled })}
          </div>
        );
      })}
    </div>
  );
}
