import { type CSSProperties, type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { useDrag } from "../../foundations/drag.js";
import { stepKey } from "../../foundations/keys.js";
import { clamp } from "../../foundations/math.js";

export interface SplitPaneTokens {
  /** Thickness of the visible divider line. */
  dividerSize: string;
  /** Divider colour (the accent shows while dragging or focused). */
  divider: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    splitPane: SplitPaneTokens;
  }
}

export interface SplitPaneProps {
  /** The first pane (left, or right in right-to-left text; top when vertical). */
  start: ReactNode;
  /** The second pane (right, or left in right-to-left text; bottom when vertical). */
  end: ReactNode;
  /** Accessible name of the divider, e.g. "Resize the file list". */
  label: string;
  /** `horizontal`: panes side by side. `vertical`: stacked. */
  orientation?: "horizontal" | "vertical";
  /**
   * `percent` (default): sizes are percent of the whole. `px`: the sized pane (see `anchor`) has a fixed width (or
   * height) in pixels, such as a sidebar that keeps its size as the window grows.
   */
  unit?: "percent" | "px";
  /**
   * Which pane the size, limits, collapse and divider value belong to. `start` (default): the first pane, such as a
   * left sidebar. `end`: the second pane, such as a right sidebar or a bottom dock that keeps its pixels as the window
   * grows.
   */
  anchor?: "start" | "end";
  /** Size of the sized pane (see `anchor`), in `unit`. Kept while it is collapsed, so expanding restores it. */
  size?: number | undefined;
  /** Starting size of the sized pane when uncontrolled, in `unit`. Default 50 percent, or 240 pixels. */
  defaultSize?: number | undefined;
  /** Called with the new size as the divider moves, on every step of a drag or key. */
  onSizeChange?: ((size: number) => void) | undefined;
  /**
   * Called once with the final size when a resize ends: the pointer is released, or the arrow (or Page, Home, End) key
   * is let go. Not called when nothing changed or the drag was cancelled. Use it to save the size.
   */
  onResizeEnd?: ((size: number) => void) | undefined;
  /** Smallest size of the sized pane, in `unit`. Default 10 percent, or 120 pixels. */
  min?: number;
  /** Largest size of the sized pane, in `unit`. Default 90 percent, or 600 pixels. */
  max?: number;
  /** Arrow keys move by this much, in `unit`. Default 5 percent, or 16 pixels. */
  step?: number;
  /**
   * Enter on the divider collapses the sized pane to 0 and restores it. Default true when `collapsed` or
   * `defaultCollapsed` is given, false otherwise.
   */
  collapsible?: boolean | undefined;
  /** Whether the sized pane is collapsed, for a sidebar or dock toggled from a menu or button. Its size is kept. */
  collapsed?: boolean | undefined;
  /** Whether the sized pane starts collapsed when `collapsed` is not controlled. */
  defaultCollapsed?: boolean | undefined;
  /** Called when the divider collapses or expands the pane (Enter, or a key or drag that opens it). */
  onCollapsedChange?: ((collapsed: boolean) => void) | undefined;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-split-pane-* tokens. */
  style?: CSSProperties;
}

const round = (n: number) => Math.round(n * 10) / 10;
const RESIZE_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

/**
 * Two panes with a divider people can move: drag it (mouse, pen or touch), or focus it and use the arrow keys. An APG
 * window splitter: the divider is a focusable separator whose value is the sized pane's size (0 when collapsed).
 */
export function SplitPane({
  start,
  end,
  label,
  orientation = "horizontal",
  unit = "percent",
  anchor = "start",
  size,
  defaultSize,
  onSizeChange,
  onResizeEnd,
  min: minProp,
  max: maxProp,
  step: stepProp,
  collapsible: collapsibleProp,
  collapsed: collapsedProp,
  defaultCollapsed,
  onCollapsedChange,
  className,
  style,
}: SplitPaneProps) {
  const px = unit === "px";
  const min = minProp ?? (px ? 120 : 10);
  const max = maxProp ?? (px ? 600 : 90);
  const step = stepProp ?? (px ? 16 : 5);
  const collapsible = collapsibleProp ?? (collapsedProp !== undefined || defaultCollapsed !== undefined);
  const endAnchor = anchor === "end";
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const divider = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useControllableState(size, defaultSize ?? (px ? 240 : 50), onSizeChange);
  const [collapsed, setCollapsed] = useControllableState(
    collapsedProp,
    defaultCollapsed ?? false,
    onCollapsedChange,
  );
  // The values as last set, ahead of the next render: a drag's moves and its end can arrive in one batch.
  const sizeNow = useRef(current);
  sizeNow.current = current;
  const shutNow = useRef(collapsed);
  shutNow.current = collapsed;
  const dragFrom = useRef({ size: current, collapsed });
  const keyFrom = useRef<number | null>(null);
  const vertical = orientation === "vertical";

  const set = (next: number) => {
    const value = round(clamp(next, min, max));
    if (value === sizeNow.current) return;
    sizeNow.current = value;
    setCurrent(value);
  };
  const collapse = (next: boolean) => {
    if (next === shutNow.current) return;
    shutNow.current = next;
    setCollapsed(next);
  };

  const fromPoint = (point: { x: number; y: number }) => {
    const box = (root.current as HTMLDivElement).getBoundingClientRect();
    const rtl = !vertical && isRtl(root.current as HTMLDivElement);
    // Measured from the sized pane's own outer edge.
    let offset: number;
    if (vertical) offset = endAnchor ? box.bottom - point.y : point.y - box.top;
    else offset = rtl !== endAnchor ? box.right - point.x : point.x - box.left;
    set(px ? offset : ((vertical ? offset / box.height : offset / box.width) || 0) * 100);
  };
  // Dragging the divider through detent; Escape puts it back where the drag began (collapsed again if it was).
  useDrag(divider, {
    onStart: () => {
      dragFrom.current = { size: sizeNow.current, collapsed: shutNow.current };
      divider.current?.focus({ preventScroll: true });
      setDragging(true);
    },
    onMove: ({ point }) => {
      collapse(false);
      fromPoint(point);
    },
    onEnd: (_, cancelled) => {
      const from = dragFrom.current;
      if (cancelled) {
        set(from.size);
        collapse(from.collapsed);
      } else if (sizeNow.current !== from.size) onResizeEnd?.(sizeNow.current);
      setDragging(false);
    },
  });

  // A keyboard resize ends when its key is let go (or focus leaves): one onResizeEnd for a held, repeating key.
  const endKeyResize = () => {
    const from = keyFrom.current;
    keyFrom.current = null;
    if (from !== null && sizeNow.current !== from) onResizeEnd?.(sizeNow.current);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (collapsible && event.key === "Enter") {
      event.preventDefault();
      collapse(!shutNow.current);
      return;
    }
    if (!RESIZE_KEYS.has(event.key)) return;
    const options = {
      min,
      max,
      step,
      axis: vertical ? ("y" as const) : ("x" as const),
      // The keys move the divider, so moving it towards the sized pane shrinks it.
      rtl: isRtl(event.currentTarget) !== endAnchor,
      downAdds: !endAnchor,
    };
    // Collapsed, the value is 0: a key that grows it opens the pane from there (at least `min`); others do nothing.
    const target = shutNow.current
      ? stepKey(event, { ...options, value: 0, min: 0 })
      : stepKey(event, { ...options, value: sizeNow.current });
    if (target === undefined) return;
    event.preventDefault();
    keyFrom.current ??= sizeNow.current;
    if (shutNow.current) {
      if (target <= 0) return;
      collapse(false);
    }
    set(target);
  };

  const shown = collapsed ? 0 : current;
  return (
    <div
      ref={root}
      className={className ? `cy-split-pane ${className}` : "cy-split-pane"}
      data-orientation={orientation}
      data-anchor={anchor}
      data-dragging={dragging ? "" : undefined}
      style={{ "--_size": px ? `${shown}px` : `${shown}%`, ...style } as CSSProperties}
    >
      <div
        id={`${id}-start`}
        className="cy-split-pane-pane cy-reset"
        data-pane="start"
        data-collapsed={collapsed && !endAnchor ? "" : undefined}
      >
        {start}
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: an APG window splitter is a focusable separator; <hr> cannot take focus or a value */}
      <div
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-controls={`${id}-${anchor}`}
        aria-orientation={vertical ? "horizontal" : "vertical"}
        aria-valuenow={shown}
        aria-valuemin={collapsible ? 0 : min}
        aria-valuemax={max}
        aria-valuetext={px ? `${Math.round(shown)} pixels` : `${Math.round(shown)}%`}
        ref={divider}
        className="cy-split-pane-divider cy-reset"
        onKeyDown={onKeyDown}
        onKeyUp={endKeyResize}
        onBlur={endKeyResize}
      />
      <div
        id={`${id}-end`}
        className="cy-split-pane-pane cy-reset"
        data-pane="end"
        data-collapsed={collapsed && endAnchor ? "" : undefined}
      >
        {end}
      </div>
    </div>
  );
}
