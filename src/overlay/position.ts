import { clamp } from "../foundations/math.js";
/** Pure overlay positioning: preferred side, flip when it does not fit, shift to stay inside the viewport. */

export type Placement = "top" | "bottom" | "start" | "end";

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const MARGIN = 8;
const OPPOSITE: Record<Placement, Placement> = { top: "bottom", bottom: "top", start: "end", end: "start" };

export function computePosition(
  anchor: Box,
  floating: { width: number; height: number },
  viewport: { width: number; height: number },
  placement: Placement,
  offset: number,
  dir: "ltr" | "rtl",
  /**
   * Cross-axis alignment: centred on the anchor; `start`, flush with its start edge for top/bottom (lists, menus);
   * `flush`, that and also flush with its top edge for start/end (submenus beside their item).
   */
  align: "center" | "start" | "flush" = "center",
): { x: number; y: number; placement: Placement } {
  const crossX =
    align !== "center"
      ? dir === "rtl"
        ? anchor.right - floating.width
        : anchor.left
      : anchor.left + anchor.width / 2 - floating.width / 2;
  const crossY = align === "flush" ? anchor.top : anchor.top + anchor.height / 2 - floating.height / 2;
  const place = (p: Placement) => {
    const physical =
      p === "start"
        ? dir === "rtl"
          ? "right"
          : "left"
        : p === "end"
          ? dir === "rtl"
            ? "left"
            : "right"
          : p;
    if (physical === "top") return { x: crossX, y: anchor.top - offset - floating.height };
    if (physical === "bottom") return { x: crossX, y: anchor.bottom + offset };
    if (physical === "left") return { x: anchor.left - offset - floating.width, y: crossY };
    return { x: anchor.right + offset, y: crossY };
  };
  const fits = (p: Placement) => {
    const { x, y } = place(p);
    return p === "top" || p === "bottom"
      ? y >= MARGIN && y + floating.height <= viewport.height - MARGIN
      : x >= MARGIN && x + floating.width <= viewport.width - MARGIN;
  };
  const chosen = fits(placement) || !fits(OPPOSITE[placement]) ? placement : OPPOSITE[placement];
  const { x, y } = place(chosen);
  return {
    x: clamp(x, MARGIN, viewport.width - floating.width - MARGIN),
    y: clamp(y, MARGIN, viewport.height - floating.height - MARGIN),
    placement: chosen,
  };
}
