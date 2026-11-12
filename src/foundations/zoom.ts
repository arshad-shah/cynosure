/** Zoom maths shared by DocumentViewport, ZoomControls and the canvas: settings, limits, steps and anchoring. */

import { clamp } from "./math.js";

/** How big the content is shown: fitted to the viewport (with an optional cap in percent), or a fixed percent. */
export type ZoomSetting =
  | { kind: "fit-width"; max?: number }
  | { kind: "fit-page"; max?: number }
  | { kind: "percent"; value: number };

export const MIN_PERCENT = 25;
export const MAX_PERCENT = 800;

/**
 * A percent kept between `min` and `max` (default 25 and 800), rounded. A canvas with its own limits (20 to 300%)
 * passes them.
 */
export const clampPercent = (percent: number, min = MIN_PERCENT, max = MAX_PERCENT) =>
  Math.round(clamp(percent, min, max));

/** The steps the zoom buttons and keys go through (as document viewers do). */
export const ZOOM_STEPS = [
  25, 33, 50, 67, 75, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500, 600, 800,
];

/**
 * The next step above (1) or below (-1) `percent`; from between two steps it goes to the nearer one that way. Steps
 * outside `min` and `max` (default 25 and 800) are skipped; past the last one it stops at the limit.
 */
export function zoomStep(percent: number, direction: 1 | -1, min = MIN_PERCENT, max = MAX_PERCENT): number {
  const p = clampPercent(percent, min, max);
  if (direction === 1) return Math.min(ZOOM_STEPS.find((s) => s > p) ?? max, max);
  return Math.max([...ZOOM_STEPS].reverse().find((s) => s < p) ?? min, min);
}

/**
 * The scale (1 = 100%) a setting comes to. Fit modes fit the widest (and, for a page, tallest) page inside the viewport
 * less `gap` on each side; before the viewport is measured (width 0) they show 100%.
 */
export function zoomScale(
  setting: ZoomSetting,
  pages: readonly { width: number; height: number }[],
  viewport: { width: number; height: number },
  gap = 0,
): number {
  if (setting.kind === "percent") return clampPercent(setting.value) / 100;
  if (viewport.width <= 0) return 1;
  const widest = Math.max(1, ...pages.map((p) => p.width));
  const tallest = Math.max(1, ...pages.map((p) => p.height));
  const cap = setting.max ? clampPercent(setting.max) / 100 : Number.POSITIVE_INFINITY;
  const fitWidth = (viewport.width - 2 * gap) / widest;
  const fit =
    setting.kind === "fit-width" || viewport.height <= 0
      ? fitWidth
      : Math.min(fitWidth, (viewport.height - 2 * gap) / tallest);
  return clamp(Math.min(cap, fit), MIN_PERCENT / 100, MAX_PERCENT / 100);
}

/**
 * The scroll position that keeps the point under `anchor` (viewport pixels from the top left) in place when the content
 * grows by `factor`.
 */
export const anchoredScroll = (
  scroll: { left: number; top: number },
  anchor: { x: number; y: number },
  factor: number,
) => ({
  left: (scroll.left + anchor.x) * factor - anchor.x,
  top: (scroll.top + anchor.y) * factor - anchor.y,
});
