import type { CSSProperties } from "react";
import { TONES, type Tone } from "../tokens/schema.js";

/** An accent edge: a tone name, which uses that tone's colour, or any CSS colour. */
export type Edge = Tone | (string & {});

/** Whether `value` names a `Tone` (rather than being a CSS colour). */
export function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

/**
 * The CSS colour of a tone name or a CSS colour: a tone is its colour token (the ink for neutral), so a theme still
 * recolours it; anything else is returned as it is. Edges (`edgeProps`) and Calendar's mark dots use it.
 */
export function toneColour(value: Edge): string {
  if (!isTone(value)) return value;
  return value === "neutral" ? "var(--cy-color-ink)" : `var(--cy-color-${value})`;
}

/**
 * The attributes of an element drawing an accent edge (Card, Disclosure): `data-edge` (the tone, or "custom") for its
 * stylesheet to draw the border, and the edge's colour (`toneColour`) as the private `--_edge` beside the caller's
 * `style`.
 */
export function edgeProps(
  edge: Edge | undefined,
  style: CSSProperties | undefined,
): { "data-edge": string | undefined; style: CSSProperties | undefined } {
  if (!edge) return { "data-edge": undefined, style };
  return {
    "data-edge": isTone(edge) ? edge : "custom",
    style: { "--_edge": toneColour(edge), ...style } as CSSProperties,
  };
}
