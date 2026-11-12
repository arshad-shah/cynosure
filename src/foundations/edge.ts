import type { CSSProperties } from "react";
import type { Tone } from "../tokens/schema.js";

const TONES: readonly string[] = ["accent", "neutral", "danger", "success", "warning", "info"];

/** An accent edge: a tone name, which uses that tone's colour, or any CSS colour. */
export type Edge = Tone | (string & {});

/**
 * The attributes of an element drawing an accent edge (Card, Disclosure): `data-edge` (the tone, or "custom") for its
 * stylesheet to draw the border, and the edge's colour as the private `--_edge` beside the caller's `style`. A tone is
 * its colour token (the ink for neutral), so a theme still recolours it.
 */
export function edgeProps(
  edge: Edge | undefined,
  style: CSSProperties | undefined,
): { "data-edge": string | undefined; style: CSSProperties | undefined } {
  if (!edge) return { "data-edge": undefined, style };
  const tone = TONES.includes(edge);
  const colour = !tone ? edge : edge === "neutral" ? "var(--cy-color-ink)" : `var(--cy-color-${edge})`;
  return { "data-edge": tone ? edge : "custom", style: { "--_edge": colour, ...style } as CSSProperties };
}
