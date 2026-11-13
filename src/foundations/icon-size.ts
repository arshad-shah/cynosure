import type { DenseSize } from "../tokens/schema.js";

/**
 * The Icon size for a control of `size`: `sm` icons in `xs` controls, `md` in `sm` and `md`, `lg` in `lg`, about half
 * the control's height from `md` up; a control without a size is `md`. Every control with an icon uses it, so a field,
 * a button and a segment of the same size show the same icon.
 */
export const iconSizeFor = (size: DenseSize = "md"): "sm" | "md" | "lg" =>
  size === "xs" ? "sm" : size === "lg" ? "lg" : "md";
