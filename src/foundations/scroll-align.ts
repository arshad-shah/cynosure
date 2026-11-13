/** Where scrolling something into view puts it: the least scrolling that shows it, its start, or its centre. */
export type ScrollAlign = "nearest" | "start" | "center";

/**
 * The scroll position, along one axis, that brings a span (`start` and `size`, in content pixels) into a view `length`
 * long now scrolled to `at`. `nearest` scrolls the least that shows it whole and, when it is longer than the view,
 * shows its start (as `Element.scrollIntoView` does); `start` puts it at the start of the view; `center` in the middle.
 * The result may fall outside the scroll range: the browser clamps it. Translation-invariant, so with `at = 0` and a
 * `start` measured from the view it is the distance to scroll (ScrollArea). ScrollArea, VirtualList and
 * `useVirtualWindow`'s `reveal` (Tree, DataGrid) use it.
 */
export function alignedScroll(
  at: number,
  length: number,
  start: number,
  size: number,
  align: ScrollAlign = "nearest",
) {
  if (align === "start") return start;
  if (align === "center") return start + size / 2 - length / 2;
  if (start < at) return start;
  if (start + size > at + length) return Math.min(start, start + size - length);
  return at;
}
