import { type RefObject, useMemo, useState } from "react";
import { useClientLayoutEffect } from "./client-layout-effect.js";

export interface VirtualWindowOptions {
  /** How many rows there are in all. */
  count: number;
  /** Off renders every row (and measures nothing). Default true. */
  enabled?: boolean;
  /** A rendered row, measured for the row size when rows share one height (no `sizes`). */
  rowSelector?: string;
  /**
   * Each row's size, when rows differ (pages of mixed sizes). Then nothing is measured but the viewport, and rows sit
   * `gap` apart with `gap` before the first and after the last.
   */
  sizes?: readonly number[] | undefined;
  /** Space between rows, and before the first and after the last, with `sizes`. Default 0. */
  gap?: number;
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
  /** Where row `index` starts, from the top of the content. */
  offsetOf: (index: number) => number;
  /** Row `index`'s size. */
  sizeOf: (index: number) => number;
  /** The viewport's scroll position and size, as last measured. */
  view: { top: number; height: number; width: number };
}

/**
 * Windowing for a scrolling list: render only the rows in view plus a few either side. Equal rows (lists, trees) are
 * measured from one rendered row, so their height comes from CSS (tokens, touch hit areas) and a row that grows to
 * 44px on a touch screen is still placed right. Rows of different sizes (document pages) pass `sizes` instead.
 */
export function useVirtualWindow(
  scroller: RefObject<HTMLElement | null>,
  {
    count,
    enabled = true,
    rowSelector,
    sizes,
    gap = 0,
    estimate = 32,
    overscan = 6,
    keep = -1,
  }: VirtualWindowOptions,
): VirtualWindow {
  const [view, setView] = useState({ top: 0, height: 0, width: 0, row: 0 });
  useClientLayoutEffect(() => {
    const el = scroller.current;
    if (!enabled || !el) return;
    const measure = () => {
      const row = (rowSelector && el.querySelector<HTMLElement>(rowSelector)?.offsetHeight) || estimate;
      const { clientHeight: height, clientWidth: width } = el;
      setView((v) =>
        v.height === height && v.width === width && v.row === row ? v : { ...v, height, width, row },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, rowSelector, estimate, count > 0]);

  const rowSize = view.row || estimate;
  // With sizes: each row's start, `gap` apart.
  const starts = useMemo(() => {
    if (!sizes) return null;
    const out: number[] = [];
    let at = gap;
    for (const size of sizes) {
      out.push(at);
      at += size + gap;
    }
    return out;
  }, [sizes, gap]);
  const offsetOf = (i: number) => (starts ? (starts[i] as number) : i * rowSize);
  const sizeOf = (i: number) => (sizes ? (sizes[i] as number) : rowSize);
  const total = starts ? (count ? offsetOf(count - 1) + sizeOf(count - 1) + gap : 0) : count * rowSize;
  /** The first row that ends below `y`. */
  const rowAt = (y: number) => {
    if (!starts) return Math.floor(y / rowSize);
    let lo = 0;
    let hi = count;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (offsetOf(mid) + sizeOf(mid) <= y) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  let indices: number[];
  if (enabled) {
    const height = view.height || rowSize * 20;
    const first = Math.max(0, rowAt(view.top) - overscan);
    const last = Math.min(count, rowAt(view.top + height - 1) + 1 + overscan);
    indices = Array.from({ length: Math.max(0, last - first) }, (_, i) => first + i);
    if (keep >= 0 && keep < count && (keep < first || keep >= last)) indices.push(keep);
  } else indices = Array.from({ length: count }, (_, i) => i);

  return {
    indices,
    rowSize,
    total,
    offsetOf,
    sizeOf,
    view: { top: view.top, height: view.height, width: view.width },
    onScroll: (top) => setView((v) => (v.top === top ? v : { ...v, top })),
    reveal: (index) => {
      const el = scroller.current;
      if (!enabled || !el) return;
      const top = offsetOf(index);
      const size = sizeOf(index);
      if (top < el.scrollTop) el.scrollTop = top;
      else if (top + size > el.scrollTop + el.clientHeight) el.scrollTop = top + size - el.clientHeight;
    },
  };
}
