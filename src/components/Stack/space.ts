import type { AriaAttributes, HTMLAttributes } from "react";

/** A step of the theme's space scale (`--cy-space-0` … `--cy-space-10`). */
export type Space = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

/** The padding props shared by the layout primitives (Stack, Inline, Grid). */
export interface PaddingProps {
  /** Space token of padding on all four sides of the box. Default: none. */
  padding?: Space | undefined;
  /** Space token of padding at the inline start and end (left and right in English). Wins over `padding`. */
  paddingInline?: Space | undefined;
  /** Space token of padding at the block start and end (top and bottom in English). Wins over `padding`. */
  paddingBlock?: Space | undefined;
}

/** The space token a key stands for, as a CSS value. */
export const space = (key: Space) => `var(--cy-space-${key})`;

/**
 * The private custom properties the layout CSS reads its padding from, for the sides that are set. Sides that are
 * not set are left out: the stylesheet resets them to zero on every root, so a nested layout never inherits them.
 */
export function paddingVars({ padding, paddingInline = padding, paddingBlock = padding }: PaddingProps) {
  const vars: Record<string, string> = {};
  if (paddingInline) vars["--_pad-inline"] = space(paddingInline);
  if (paddingBlock) vars["--_pad-block"] = space(paddingBlock);
  return vars;
}

/**
 * The named widths of the layout scale. Grid's per-breakpoint `columns` measure the grid's own width; `hideBelow` and
 * `hideAbove` measure the window. A breakpoint applies from its width upwards. `base.css` and `grid.css` repeat these
 * values (a media or container query cannot read a custom property): change them together.
 */
export const BREAKPOINTS = { sm: "30rem", md: "45rem", lg: "60rem", xl: "75rem" } as const;

/** A named width of the layout scale (`BREAKPOINTS`). */
export type Breakpoint = keyof typeof BREAKPOINTS;

/** Attributes every layout primitive passes to its element: an id to link to, a role and ARIA attributes. */
export interface LayoutAttributes extends Pick<HTMLAttributes<HTMLElement>, "id" | "role">, AriaAttributes {}

/** Showing or hiding a layout box by the width of the window, with no script. */
export interface VisibilityProps {
  /** Hidden while the window is narrower than this breakpoint (`md`: below 45rem). */
  hideBelow?: Breakpoint | undefined;
  /** Hidden from this breakpoint upwards (`md`: 45rem and wider). */
  hideAbove?: Breakpoint | undefined;
}

/** The data attributes `base.css` hides a box by. */
export const visibilityAttrs = ({ hideBelow, hideAbove }: VisibilityProps) => ({
  "data-cy-hide-below": hideBelow,
  "data-cy-hide-above": hideAbove,
});
