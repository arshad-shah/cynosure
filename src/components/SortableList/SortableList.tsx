import { sortable } from "@arshad-shah/detent";
import { type CSSProperties, type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { grip } from "../../icons/grip.js";
import type { Size } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface SortableListTokens {
  /** Background of a row. */
  itemBackground: string;
  /** Corner radius of a row. */
  radius: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    sortableList: SortableListTokens;
  }
}

export interface SortableItem {
  id: string;
  /** Plain text: used in announcements and the handle's name. Shown when there is no `content`. */
  label: string;
  /** What the row shows, if more than the label. */
  content?: ReactNode;
}

export interface SortableListLabels {
  /** Handle name. Default: "Move Docs". */
  handle: (label: string) => string;
  /** Read with every handle. */
  instructions: string;
  pickedUp: (label: string, position: number, total: number) => string;
  moved: (label: string, position: number, total: number) => string;
  dropped: (label: string, position: number, total: number) => string;
  cancelled: (label: string) => string;
}

export interface SortableListProps {
  /** Accessible name of the list. */
  label: string;
  items?: SortableItem[] | undefined;
  defaultItems?: SortableItem[];
  /** Called with the items in their new order after a move is dropped. */
  onReorder?: ((items: SortableItem[]) => void) | undefined;
  disabled?: boolean;
  size?: Size;
  labels?: Partial<SortableListLabels>;
  className?: string;
  /** Layout only. Restyle through --cy-sortable-list-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: SortableListLabels = {
  handle: (label) => `Move ${label}`,
  instructions: "Press Space to pick up, the arrow keys to move, Space to drop, Escape to cancel.",
  pickedUp: (label, p, n) => `${label} picked up. Position ${p} of ${n}.`,
  moved: (label, p, n) => `${label} moved to position ${p} of ${n}.`,
  dropped: (label, p, n) => `${label} dropped at position ${p} of ${n}.`,
  cancelled: (label) => `Move cancelled. ${label} is back where it was.`,
};

const moveItem = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
};

/**
 * A list people put in order: drag a row by its handle (mouse, pen or touch), or focus the handle, press Space and
 * move it with the arrow keys. Every step is announced.
 */
export function SortableList({
  label,
  items,
  defaultItems = [],
  onReorder,
  disabled = false,
  size = "md",
  labels,
  className,
  style,
}: SortableListProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const controlled = items !== undefined;
  const [own, setOwn] = useState(defaultItems);
  const committed = controlled ? items : own;
  /**
   * While moving: the order being previewed, and the row being moved. Kept in refs too, so events that arrive before
   * React re-renders (a fast drag's move and release) always see the latest values.
   */
  type Moving = { id: string; by: "keyboard" | "pointer" };
  const [preview, setPreviewState] = useState<SortableItem[] | null>(null);
  const [moving, setMovingState] = useState<Moving | null>(null);
  const previewRef = useRef<SortableItem[] | null>(null);
  const movingRef = useRef<Moving | null>(null);
  const setPreview = (next: SortableItem[] | null) => {
    previewRef.current = next;
    setPreviewState(next);
  };
  const setMoving = (next: Moving | null) => {
    movingRef.current = next;
    setMovingState(next);
  };
  const [said, setSaid] = useState("");
  const list = useRef<HTMLUListElement>(null);
  const shown = preview ?? committed;
  const total = shown.length;

  const handleOf = (itemId: string) =>
    list.current?.querySelector<HTMLButtonElement>(
      `[data-id="${CSS.escape(itemId)}"] .cy-sortable-list-handle`,
    );

  const start = (item: SortableItem) => {
    setPreview(committed);
    setMoving({ id: item.id, by: "keyboard" });
    setSaid(text.pickedUp(item.label, committed.indexOf(item) + 1, committed.length));
  };
  // drop, cancel and shift run only while a row is moving (their callers check), so the refs are set.
  const drop = () => {
    const moving = movingRef.current as Moving;
    const preview = previewRef.current as SortableItem[];
    const item = preview.find((i) => i.id === moving.id) as SortableItem;
    const at = preview.indexOf(item);
    const changed = preview.some((i, n) => i.id !== committed[n]?.id);
    setSaid(text.dropped(item.label, at + 1, preview.length));
    if (changed) {
      if (!controlled) setOwn(preview);
      onReorder?.(preview);
    }
    setPreview(null);
    setMoving(null);
  };
  const cancel = () => {
    const moving = movingRef.current as Moving;
    const item = committed.find((i) => i.id === moving.id) as SortableItem;
    setSaid(text.cancelled(item.label));
    setPreview(null);
    setMoving(null);
  };
  const shift = (delta: number) => {
    const moving = movingRef.current as Moving;
    const preview = previewRef.current as SortableItem[];
    const from = preview.findIndex((i) => i.id === moving.id);
    const to = Math.min(Math.max(from + delta, 0), preview.length - 1);
    if (to === from) return;
    setPreview(moveItem(preview, from, to));
    setSaid(text.moved((preview[from] as SortableItem).label, to + 1, preview.length));
    // The moved row's handle keeps focus as it changes place.
    requestAnimationFrame(() => handleOf(moving.id)?.focus());
  };

  // A disabled handle cannot be focused, so it never gets key presses.
  const onKeyDown = (item: SortableItem) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const moving = movingRef.current;
    const active = moving?.id === item.id && moving.by === "keyboard";
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (active) drop();
      else if (!moving) start(item);
      return;
    }
    if (!active) return;
    const moves: Record<string, () => void> = {
      ArrowUp: () => shift(-1),
      ArrowDown: () => shift(1),
      Home: () => shift(-total),
      End: () => shift(total),
      Escape: cancel,
      Tab: drop,
    };
    const move = moves[event.key];
    if (!move) return;
    if (event.key !== "Tab") event.preventDefault();
    move();
  };

  // Pointer, touch and pen dragging come from detent (one input path, FLIP animation, auto-scroll). Its own keyboard
  // mode stays off: Cynosure's keyboard mode above has labelled, overridable announcements inside the app.
  const latest = useRef({ committed, controlled, onReorder, text, disabled });
  latest.current = { committed, controlled, onReorder, text, disabled };
  useClientLayoutEffect(() => {
    const el = list.current as HTMLUListElement;
    let sorted = false;
    const itemOf = (node: HTMLElement) =>
      latest.current.committed.find((i) => i.id === node.dataset.id) as SortableItem;
    const bound = sortable(el, {
      handle: ".cy-sortable-list-handle",
      direction: "y",
      keyboard: false,
      // The grip is a dedicated handle that never scrolls the page, so touch needs no press-and-hold.
      delay: 0,
      get animation() {
        const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const base = Number.parseFloat(getComputedStyle(el).getPropertyValue("--cy-motion-slow"));
        return reduced ? 0 : Number.isFinite(base) ? base : 180;
      },
      get disabled() {
        return latest.current.disabled;
      },
      onStart: (node, from) => {
        if (movingRef.current) return false;
        const item = itemOf(node);
        sorted = false;
        setMoving({ id: item.id, by: "pointer" });
        setSaid(latest.current.text.pickedUp(item.label, from.index + 1, latest.current.committed.length));
      },
      onSort: ({ item: node, from, to }) => {
        sorted = true;
        // Put the node back where React rendered it, then let React apply the new order: React stays the DOM's owner.
        node.remove();
        el.insertBefore(node, el.children[from.index] ?? null);
        const { committed: now, controlled: isControlled, onReorder: report, text: words } = latest.current;
        const next = moveItem(now, from.index, to.index);
        setSaid(words.dropped((now[from.index] as SortableItem).label, to.index + 1, next.length));
        if (!isControlled) setOwn(next);
        report?.(next);
      },
      onEnd: (node, cancelled) => {
        const item = itemOf(node);
        setMoving(null);
        if (cancelled) setSaid(latest.current.text.cancelled(item.label));
        else if (!sorted) {
          const at = latest.current.committed.indexOf(item);
          setSaid(latest.current.text.dropped(item.label, at + 1, latest.current.committed.length));
        }
      },
    });
    return () => bound.destroy();
  }, []);

  return (
    <div
      className={className ? `cy-sortable-list ${className}` : "cy-sortable-list"}
      data-size={size}
      style={style}
    >
      <ul ref={list} className="cy-sortable-list-items cy-reset" aria-label={label}>
        {shown.map((item) => (
          <li
            key={item.id}
            data-id={item.id}
            className="cy-sortable-list-item cy-reset"
            data-moving={moving?.id === item.id ? "" : undefined}
          >
            <IconButton
              icon={grip}
              label={text.handle(item.label)}
              variant="ghost"
              tone="neutral"
              size="sm"
              disabled={disabled}
              className="cy-sortable-list-handle"
              aria-describedby={`${id}-how`}
              aria-pressed={moving?.id === item.id}
              tooltipPlacement="start"
              onKeyDown={onKeyDown(item)}
            />
            <div className="cy-sortable-list-content cy-reset">{item.content ?? item.label}</div>
          </li>
        ))}
      </ul>
      <span id={`${id}-how`} className="cy-sortable-list-hidden cy-reset">
        {text.instructions}
      </span>
      <span className="cy-sortable-list-hidden cy-reset" role="status">
        {said}
      </span>
    </div>
  );
}
