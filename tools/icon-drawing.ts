/**
 * What an icon draws, as a comparable key, so Facet never holds two icons with the same drawing (the unit test in
 * `tests/unit/icons.test.ts` and `cy new icon` both use it). Kept in `tools/` so it never ships.
 */
import type { IconData } from "../src/icons/types";

const round = (v: unknown) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v);

/**
 * The icon's drawing with everything that does not change what it draws taken out: `animate` is dropped, numeric
 * attributes are rounded to 3 decimals, attributes and elements are sorted. `fill` is kept: a filled shape is not
 * the same drawing as its stroked outline.
 */
export function drawingKey(icon: Pick<IconData, "body" | "fill">): string {
  const elements = icon.body.map(([tag, attrs]) => {
    const kept = Object.entries(attrs as object)
      .filter(([k]) => k !== "animate")
      .map(([k, v]) => [k, round(v)] as const)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return JSON.stringify([tag, kept]);
  });
  return JSON.stringify({ fill: Boolean(icon.fill), body: elements.sort() });
}

/** The first icon in `icons` that draws the same as `icon` (other than `icon` itself, by name), if any. */
export function sameDrawing(icon: IconData, icons: Iterable<IconData>): IconData | undefined {
  const key = drawingKey(icon);
  for (const other of icons) if (other.name !== icon.name && drawingKey(other) === key) return other;
  return undefined;
}

/** Groups of icon names that share one drawing (empty when every drawing is unique). */
export function duplicateDrawings(icons: Iterable<IconData>): string[][] {
  const byKey = new Map<string, string[]>();
  for (const icon of icons) {
    const key = drawingKey(icon);
    byKey.set(key, [...(byKey.get(key) ?? []), icon.name]);
  }
  return [...byKey.values()].filter((names) => names.length > 1);
}
