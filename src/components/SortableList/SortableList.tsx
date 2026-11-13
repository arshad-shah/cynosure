import { sortable } from "@arshad-shah/detent";
import { type CSSProperties, type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { LiveRegion, useLiveMessage } from "../../foundations/LiveRegion/LiveRegion.js";
import { clamp } from "../../foundations/math.js";
import { motionMs } from "../../foundations/motion.js";
import { moveItems } from "../../foundations/reorder.js";
import { grip } from "../../icons/grip.js";
import type { Size } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface SortableListTokens {
  /** Background of a row. */
  itemBackground: string;
  /** Corner radius of a row. */
  radius: string;
  /** Smallest tile width in the grid layout. */
  tileMin: string;
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
  /** Controlled items, in order: `{ id, label, content? }`. */
  items?: SortableItem[] | undefined;
  /** Starting items when uncontrolled. */
  defaultItems?: SortableItem[];
  /** Called with the items in their new order after a move is dropped. */
  onReorder?: ((items: SortableItem[]) => void) | undefined;
  /** Disables the handles, so nothing can be moved. */
  disabled?: boolean;
  /** `list` (rows, default) or `grid` (tiles that wrap: file grids, page thumbnails). */
  layout?: "list" | "grid";
  /** Text size of the rows. Default "md". */
  size?: Size;
  /** Replace the built-in English text: the handle name, the instructions and the announcements. */
  labels?: Partial<SortableListLabels>;
  /** Added to the root element, for layout. */
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

const byId = (item: SortableItem) => item.id;

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
  layout = "list",
  size = "md",
  labels,
  className,
  style,
}: SortableListProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const [committed, setCommitted] = useControllableState(items, defaultItems, onReorder);
  /**
   * While moving: the row being moved and, from the keyboard, the place it is headed for. The preview is that move
   * applied to the items as they are now, so items the parent adds or removes meanwhile are shown and kept. Kept in
   * refs too, so events that arrive before React re-renders (a fast drag's move and release) see the latest values.
   */
  type Moving = { id: string; by: "keyboard" | "pointer" };
  const [target, setTargetState] = useState<number | null>(null);
  const [moving, setMovingState] = useState<Moving | null>(null);
  const targetRef = useRef<number | null>(null);
  const movingRef = useRef<Moving | null>(null);
  const setTarget = (next: number | null) => {
    targetRef.current = next;
    setTargetState(next);
  };
  const setMoving = (next: Moving | null) => {
    movingRef.current = next;
    setMovingState(next);
  };
  const [said, setSaid] = useLiveMessage();
  const list = useRef<HTMLUListElement>(null);
  /** The keyboard move applied to `items`: where the moving row is, and where it goes. */
  const planOf = (items: SortableItem[]) => {
    const m = movingRef.current;
    const from = m && targetRef.current !== null ? items.findIndex((i) => i.id === m.id) : -1;
    if (from < 0) return null;
    return {
      item: items[from] as SortableItem,
      from,
      to: clamp(targetRef.current as number, 0, items.length - 1),
    };
  };
  const plan = moving?.by === "keyboard" && target !== null ? planOf(committed) : null;
  const shown = plan ? moveItems(committed, [plan.item.id], plan.to, byId) : committed;
  const total = shown.length;

  const handleOf = (itemId: string) =>
    list.current?.querySelector<HTMLButtonElement>(
      `[data-id="${CSS.escape(itemId)}"] .cy-sortable-list-handle`,
    );

  const end = () => {
    setTarget(null);
    setMoving(null);
  };
  const start = (item: SortableItem) => {
    const at = committed.findIndex((i) => i.id === item.id);
    setMoving({ id: item.id, by: "keyboard" });
    setTarget(at);
    setSaid(text.pickedUp(item.label, at + 1, committed.length));
  };
  // drop, cancel and shift run only while a row is moving (their callers check), so the refs are set.
  const drop = () => {
    const p = planOf(committed);
    end();
    // The row was removed meanwhile: nothing to drop.
    if (!p) return;
    setSaid(text.dropped(p.item.label, p.to + 1, committed.length));
    if (p.to !== p.from) setCommitted(moveItems(committed, [p.item.id], p.to, byId));
  };
  const cancel = () => {
    const p = planOf(committed);
    end();
    if (p) setSaid(text.cancelled(p.item.label));
  };
  /** Tiles in one row of the grid, measured from the layout (1 for a list). */
  const columns = () => {
    const tiles = [...(list.current as HTMLUListElement).children] as HTMLElement[];
    const top = tiles[0]?.offsetTop;
    const n = tiles.findIndex((t) => t.offsetTop !== top);
    return n < 0 ? tiles.length : n;
  };
  const shift = (delta: number) => {
    const p = planOf(committed);
    if (!p) return;
    const to = clamp(p.to + delta, 0, committed.length - 1);
    if (to === p.to) return;
    setTarget(to);
    setSaid(text.moved(p.item.label, to + 1, committed.length));
    refocus.current = p.item.id;
  };
  // The moved row's handle keeps focus as it changes place: put back in the same commit, so nothing (a click) can come
  // between the row moving and its handle taking focus again.
  const refocus = useRef<string | null>(null);
  useClientLayoutEffect(() => {
    if (refocus.current === null) return;
    handleOf(refocus.current)?.focus();
    refocus.current = null;
  });
  // Focus leaving the handle mid-move (a click elsewhere, a screen reader's own navigation) cancels the move. A row
  // changing place can blur its handle for a moment, so check again a frame later.
  const onBlur = (item: SortableItem) => () => {
    const m = movingRef.current;
    if (m?.id !== item.id || m.by !== "keyboard") return;
    requestAnimationFrame(() => {
      const now = movingRef.current;
      if (now?.id !== item.id || now.by !== "keyboard") return;
      const handle = handleOf(item.id);
      if (handle && (handle.getRootNode() as Document | ShadowRoot).activeElement === handle) return;
      cancelRef.current();
    });
  };
  const cancelRef = useRef(cancel);
  cancelRef.current = cancel;

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
    // In a grid, Left and Right move one place (following the reading direction) and Up and Down a whole row.
    const across = isRtl(event.currentTarget) ? -1 : 1;
    const row = layout === "grid" ? columns() : 1;
    const moves: Record<string, () => void> = {
      ArrowUp: () => shift(-row),
      ArrowDown: () => shift(row),
      ...(layout === "grid" ? { ArrowLeft: () => shift(-across), ArrowRight: () => shift(across) } : {}),
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
  const latest = useRef({ committed, text, disabled });
  latest.current = { committed, text, disabled };
  useClientLayoutEffect(() => {
    const el = list.current as HTMLUListElement;
    let sorted = false;
    const itemOf = (node: HTMLElement) =>
      latest.current.committed.find((i) => i.id === node.dataset.id) as SortableItem;
    const bound = sortable(el, {
      handle: ".cy-sortable-list-handle",
      direction: layout === "grid" ? "grid" : "y",
      keyboard: false,
      // The grip is a dedicated handle that never scrolls the page, so touch needs no press-and-hold.
      delay: 0,
      get animation() {
        return motionMs(el);
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
        const { committed: now, text: words } = latest.current;
        const moved = now[from.index] as SortableItem;
        const next = moveItems(now, [moved.id], to.index, byId);
        setSaid(words.dropped(moved.label, to.index + 1, next.length));
        setCommitted(next);
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
  }, [layout]);

  return (
    <div
      className={className ? `cy-sortable-list ${className}` : "cy-sortable-list"}
      data-size={size}
      data-layout={layout}
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
              onBlur={onBlur(item)}
            />
            <div className="cy-sortable-list-content cy-reset">{item.content ?? item.label}</div>
          </li>
        ))}
      </ul>
      <span id={`${id}-how`} className="cy-reset cy-visually-hidden">
        {text.instructions}
      </span>
      <LiveRegion {...said} className="cy-reset" />
    </div>
  );
}
