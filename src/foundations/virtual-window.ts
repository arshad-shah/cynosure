import { type RefObject, useState } from "react";
import { useClientLayoutEffect } from "./client-layout-effect.js";

export interface VirtualWindowOptions {
  /** How many rows there are in all. */
  count: number;
  /** Off renders every row (and measures nothing). Default true. */
  enabled?: boolean;
  /** A rendered row, measured for the row size. Rows are assumed to share one height. */
  rowSelector: string;
  /** Row size before one has been measured, in CSS pixels. Default 32. */
  estimate?: number;
  /** Rows rendered either side of the view. Default 6. */
  overscan?: number;
  /** An index that is always rendered (the focused row), so focus survives scrolling it out of view. */
  keep?: number;
}

export interface VirtualWindow {
  /** Indices to render, in order (the kept row last when it is outside the view). */
  indices: number[];
  /** The measured row size. */
  rowSize: number;
  /** Total height of all rows: give it to a spacer so the scrollbar is right. */
  total: number;
  /** Pass the scroller's scrollTop on scroll. */
  onScroll: (top: number) => void;
  /** Scrolls the least distance that brings row `index` fully into view. */
  reveal: (index: number) => void;
}

/**
 * Windowing for a scrolling list of equal-height rows: measure one rendered row and the viewport, then render only the
 * rows in view plus a few either side. Heights come from CSS (tokens, touch hit areas), never from a prop, so a row
 * that grows to 44px on a touch screen is still placed right.
 */
export function useVirtualWindow(
  scroller: RefObject<HTMLElement | null>,
  { count, enabled = true, rowSelector, estimate = 32, overscan = 6, keep = -1 }: VirtualWindowOptions,
): VirtualWindow {
  const [view, setView] = useState({ top: 0, height: 0, row: 0 });
  useClientLayoutEffect(() => {
    const el = scroller.current;
    if (!enabled || !el) return;
    const measure = () => {
      const row = el.querySelector<HTMLElement>(rowSelector)?.offsetHeight || estimate;
      setView((v) =>
        v.height === el.clientHeight && v.row === row ? v : { ...v, height: el.clientHeight, row },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, rowSelector, estimate, count > 0]);

  const rowSize = view.row || estimate;
  let indices: number[];
  if (enabled) {
    const first = Math.max(0, Math.floor(view.top / rowSize) - overscan);
    const last = Math.min(count, Math.ceil((view.top + (view.height || rowSize * 20)) / rowSize) + overscan);
    indices = Array.from({ length: Math.max(0, last - first) }, (_, i) => first + i);
    if (keep >= 0 && keep < count && (keep < first || keep >= last)) indices.push(keep);
  } else indices = Array.from({ length: count }, (_, i) => i);

  return {
    indices,
    rowSize,
    total: count * rowSize,
    onScroll: (top) => setView((v) => (v.top === top ? v : { ...v, top })),
    reveal: (index) => {
      const el = scroller.current;
      if (!enabled || !el) return;
      const top = index * rowSize;
      if (top < el.scrollTop) el.scrollTop = top;
      else if (top + rowSize > el.scrollTop + el.clientHeight) el.scrollTop = top + rowSize - el.clientHeight;
    },
  };
}
