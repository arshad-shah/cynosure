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
