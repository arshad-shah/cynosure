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
  /** The first pane (left, or right in right-to-left text; top when vertical). Its size is what the divider sets. */
  start: ReactNode;
  /** The second pane (right, or left in right-to-left text; bottom when vertical). */
  end: ReactNode;
  /** Accessible name of the divider, e.g. "Resize the file list". */
  label: string;
  /** `horizontal`: panes side by side. `vertical`: stacked. */
  orientation?: "horizontal" | "vertical";
  /**
   * `percent` (default): sizes are percent of the whole. `px`: the start pane has a fixed width (or height) in pixels,
   * such as a sidebar that keeps its size as the window grows.
   */
  unit?: "percent" | "px";
  /** Size of the start pane, in `unit`. */
  size?: number | undefined;
  /** Starting size of the start pane when uncontrolled, in `unit`. Default 50 percent, or 240 pixels. */
  defaultSize?: number | undefined;
  /** Called with the new size as the divider moves. */
  onSizeChange?: ((size: number) => void) | undefined;
  /** Limits for the start pane, in `unit`. Defaults: 10 and 90 percent, or 120 and 600 pixels. */
  min?: number;
  /** Largest size of the start pane, in `unit`. Default 90 percent, or 600 pixels. */
  max?: number;
  /** Arrow keys move by this much, in `unit`. Default 5 percent, or 16 pixels. */
  step?: number;
  /** Enter collapses the start pane to 0 and restores it. */
  collapsible?: boolean;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-split-pane-* tokens. */
  style?: CSSProperties;
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Two panes with a divider people can move: drag it (mouse, pen or touch), or focus it and use the arrow keys. An APG
 * window splitter: the divider is a focusable separator whose value is the start pane's size in percent.
 */
export function SplitPane({
  start,
  end,
  label,
  orientation = "horizontal",
  unit = "percent",
  size,
  defaultSize,
  onSizeChange,
  min: minProp,
  max: maxProp,
  step: stepProp,
  collapsible = false,
  className,
  style,
}: SplitPaneProps) {
  const px = unit === "px";
  const min = minProp ?? (px ? 120 : 10);
  const max = maxProp ?? (px ? 600 : 90);
  const step = stepProp ?? (px ? 16 : 5);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const restore = useRef<number | null>(null);
  const divider = useRef<HTMLDivElement>(null);
  const dragFrom = useRef(0);
  const initial = defaultSize ?? (px ? 240 : 50);
  const [current, setCurrent] = useControllableState(size, initial, onSizeChange);
  const vertical = orientation === "vertical";

  const set = (next: number, allowCollapse = false) => {
    const value = round(allowCollapse && next === 0 ? 0 : clamp(next, min, max));
    if (value !== current) setCurrent(value);
  };

  const fromPoint = (point: { x: number; y: number }) => {
    const box = (root.current as HTMLDivElement).getBoundingClientRect();
    const rtl = !vertical && isRtl(root.current as HTMLDivElement);
    const offset = vertical ? point.y - box.top : rtl ? box.right - point.x : point.x - box.left;
    set(px ? offset : ((vertical ? offset / box.height : offset / box.width) || 0) * 100);
  };
  // Dragging the divider through detent; Escape puts it back where the drag began.
  useDrag(divider, {
    onStart: () => {
      dragFrom.current = current;
      divider.current?.focus({ preventScroll: true });
      setDragging(true);
    },
    onMove: ({ point }) => fromPoint(point),
    onEnd: (_, cancelled) => {
      if (cancelled) set(dragFrom.current, true);
      setDragging(false);
    },
  });

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = stepKey(event, {
      value: current,
      min,
      max,
      step,
      axis: vertical ? "y" : "x",
      rtl: isRtl(event.currentTarget),
      downAdds: true,
    });
    const moves: Record<string, () => void> = {};
    if (target !== undefined) moves[event.key] = () => set(target);
    if (collapsible)
      moves.Enter = () => {
        if (current === 0) set(restore.current ?? initial);
        else {
          restore.current = current;
          set(0, true);
        }
      };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    move();
  };

  return (
    <div
      ref={root}
      className={className ? `cy-split-pane ${className}` : "cy-split-pane"}
      data-orientation={orientation}
      data-dragging={dragging ? "" : undefined}
      style={{ "--_size": px ? `${current}px` : `${current}%`, ...style } as CSSProperties}
    >
      <div
        id={`${id}-start`}
        className="cy-split-pane-pane cy-reset"
        data-pane="start"
        data-collapsed={current === 0 ? "" : undefined}
      >
        {start}
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: an APG window splitter is a focusable separator; <hr> cannot take focus or a value */}
      <div
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-controls={`${id}-start`}
        aria-orientation={vertical ? "horizontal" : "vertical"}
        aria-valuenow={current}
        aria-valuemin={collapsible ? 0 : min}
        aria-valuemax={max}
        aria-valuetext={px ? `${Math.round(current)} pixels` : `${Math.round(current)}%`}
        ref={divider}
        className="cy-split-pane-divider cy-reset"
        onKeyDown={onKeyDown}
      />
      <div className="cy-split-pane-pane cy-reset" data-pane="end">
        {end}
      </div>
    </div>
  );
}
