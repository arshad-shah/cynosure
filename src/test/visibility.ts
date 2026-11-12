import { expect } from "storybook/test";
import { BREAKPOINTS, type Breakpoint } from "../components/Stack/space.js";

export const BREAKPOINT_NAMES = Object.keys(BREAKPOINTS) as Breakpoint[];

/**
 * Every box in `root` with `hideBelow` or `hideAbove` is hidden exactly when the window is on that side of the
 * breakpoint (asked of the browser through matchMedia, so it holds at whatever size the test window is), and each
 * hideBelow/hideAbove pair at one breakpoint shows exactly one of the two.
 */
export async function expectVisibilityFollowsTheWindow(root: HTMLElement) {
  const boxes = [...root.querySelectorAll<HTMLElement>("[data-cy-hide-below],[data-cy-hide-above]")];
  await expect(boxes.length).toBeGreaterThan(0);
  for (const box of boxes) {
    const below = box.dataset.cyHideBelow as Breakpoint | undefined;
    const above = box.dataset.cyHideAbove as Breakpoint | undefined;
    const width = BREAKPOINTS[(below ?? above) as Breakpoint];
    const hidden = below
      ? matchMedia(`(width < ${width})`).matches
      : matchMedia(`(width >= ${width})`).matches;
    await expect(`${box.textContent}: ${getComputedStyle(box).display === "none"}`).toBe(
      `${box.textContent}: ${hidden}`,
    );
    // Hidden boxes are out of the accessibility tree too (display: none), so nothing hidden is read or focused.
    if (hidden) await expect(box.checkVisibility()).toBe(false);
  }
}
