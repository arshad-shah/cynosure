import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { isRtl } from "../../foundations/dir.js";
import { stepKey } from "../../foundations/keys.js";

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
  end: ReactNode;
  /** Accessible name of the divider, e.g. "Resize the file list". */
  label: string;
  /** `horizontal`: panes side by side. `vertical`: stacked. */
  orientation?: "horizontal" | "vertical";
  /** Size of the start pane, in percent of the whole. */
  size?: number | undefined;
  defaultSize?: number;
  onSizeChange?: ((size: number) => void) | undefined;
  /** Limits for the start pane, in percent. Defaults: 10 and 90. */
  min?: number;
  max?: number;
  /** Arrow keys move by this many percent. Default 5. */
  step?: number;
  /** Enter collapses the start pane to 0 and restores it. */
  collapsible?: boolean;
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
  size,
  defaultSize = 50,
  onSizeChange,
  min = 10,
  max = 90,
  step = 5,
  collapsible = false,
  className,
  style,
}: SplitPaneProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState(defaultSize);
  const [dragging, setDragging] = useState(false);
  const restore = useRef<number | null>(null);
  const drag = useRef<number | null>(null);
  const controlled = size !== undefined;
  const current = controlled ? size : own;
  const vertical = orientation === "vertical";

  const set = (next: number, allowCollapse = false) => {
    const value = round(allowCollapse && next === 0 ? 0 : Math.min(max, Math.max(min, next)));
    if (value === current) return;
    if (!controlled) setOwn(value);
    onSizeChange?.(value);
  };

  const fromPointer = (event: PointerEvent<HTMLElement>) => {
    const box = root.current?.getBoundingClientRect();
    if (!box) return;
    const rtl = !vertical && isRtl(event.currentTarget);
    const offset = vertical
      ? event.clientY - box.top
      : rtl
        ? box.right - event.clientX
        : event.clientX - box.left;
    set(((vertical ? offset / box.height : offset / box.width) || 0) * 100);
  };

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
        if (current === 0) set(restore.current ?? defaultSize);
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
      style={{ "--_size": `${current}%`, ...style } as CSSProperties}
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
        aria-valuetext={`${Math.round(current)}%`}
        className="cy-split-pane-divider cy-reset"
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          drag.current = event.pointerId;
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // Synthetic events have no active pointer to capture.
          }
          event.currentTarget.focus({ preventScroll: true });
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (drag.current === event.pointerId) fromPointer(event);
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
      />
      <div className="cy-split-pane-pane cy-reset" data-pane="end">
        {end}
      </div>
    </div>
  );
}
