/**
 * Ink geometry for SignaturePad: pressure from the pen (constant for a mouse or finger), a filled, round-capped
 * outline per stroke, and SVG path data that a canvas (Path2D) and a PDF writer both read the same way. No
 * dependencies: the outline is the offset of a lightly smoothed centre line, which is all a signature needs.
 */

/** One sample: pad units (y down), pressure 0..1, tilt in degrees, time in ms. */
export interface InkPoint {
  x: number;
  y: number;
  pressure: number;
  tiltX: number;
  tiltY: number;
  t: number;
}
export type InkStroke = InkPoint[];
export type InkWeight = "thin" | "medium" | "bold";

/** Nib diameter in pad units at pressure 0.5. */
export const INK_WEIGHTS: Record<InkWeight, number> = { thin: 2.2, medium: 3.4, bold: 5 };

/**
 * Pressure for a mouse or finger, which report none. Constant, like a ballpoint: pressure simulated from speed makes
 * the line wobble as the hand speeds up and slows down, which no real pen does.
 */
export const STEADY_PRESSURE = 0.5;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * A pen's raw pressure through a response curve, eased against the last sample. Pens report light writing as
 * 0.1–0.3, a hairline if used raw, so the curve lifts the low end; easing hides the digitiser's jitter.
 */
export function penPressure(raw: number, previous: number | null): number {
  const curved = 0.15 + 0.85 * clamp(raw, 0, 1) ** 0.65;
  return previous === null ? curved : previous + (curved - previous) * 0.5;
}

/** A sample from a pointer event. `scale` maps shown CSS pixels to the pad's coordinate space. */
export function inkPoint(
  event: PointerEvent,
  rect: DOMRect,
  previous: InkPoint | null,
  scale = { x: 1, y: 1 },
): InkPoint {
  const x = (event.clientX - rect.left) * scale.x;
  const y = (event.clientY - rect.top) * scale.y;
  if (event.pointerType !== "pen")
    return { x, y, pressure: STEADY_PRESSURE, tiltX: 0, tiltY: 0, t: event.timeStamp };
  // A pen reports 0 as it lifts off: keep the last pressure, or each stroke would end in a blob or a dot.
  const pressure =
    event.pressure > 0
      ? penPressure(event.pressure, previous?.pressure ?? null)
      : (previous?.pressure ?? STEADY_PRESSURE);
  return { x, y, pressure, tiltX: event.tiltX || 0, tiltY: event.tiltY || 0, t: event.timeStamp };
}

type Vec = [number, number];
const CAP_STEPS = 8;

/** The filled outline of one stroke: a closed polygon in pad units. */
export function inkOutline(stroke: InkStroke, weight: InkWeight, scale = 1): Vec[] {
  if (stroke.length === 0) return [];
  const tilt = stroke.reduce((sum, p) => sum + Math.hypot(p.tiltX, p.tiltY), 0) / stroke.length;
  const size = INK_WEIGHTS[weight] * scale * (1 + 0.25 * Math.min(1, tilt / 60));
  // Light smoothing (1-2-1) takes the jitter out of the centre line without rounding off corners. The ends stay where
  // they were drawn, or every stroke would come up short.
  const pts = stroke.map((p, i) => {
    const r = (size / 2) * (0.4 + 1.2 * p.pressure);
    const a = stroke[i - 1];
    const b = stroke[i + 1];
    if (!a || !b) return { x: p.x, y: p.y, r };
    return { x: (a.x + 2 * p.x + b.x) / 4, y: (a.y + 2 * p.y + b.y) / 4, r };
  });
  const first = pts[0] as (typeof pts)[number];
  const arc = (cx: number, cy: number, r: number, from: number): Vec[] =>
    Array.from({ length: CAP_STEPS + 1 }, (_, k) => {
      const a = from - (Math.PI * k) / CAP_STEPS;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  if (pts.length === 1)
    return arc(first.x, first.y, first.r, 0).concat(arc(first.x, first.y, first.r, Math.PI));
  const left: Vec[] = [];
  const right: Vec[] = [];
  const angles: number[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)] as typeof p;
    const b = pts[Math.min(pts.length - 1, i + 1)] as typeof p;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    // The normal to the direction of travel: the left side of the stroke.
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    left.push([p.x + nx * p.r, p.y + ny * p.r]);
    right.push([p.x - nx * p.r, p.y - ny * p.r]);
    angles.push(Math.atan2(ny, nx));
  });
  const last = pts[pts.length - 1] as typeof first;
  // Round caps: from the left side round the end to the right side, then back round the start.
  const endCap = arc(last.x, last.y, last.r, angles[angles.length - 1] as number);
  const startCap = arc(first.x, first.y, first.r, (angles[0] as number) + Math.PI);
  return [...left, ...endCap, ...right.reverse(), ...startCap];
}

const f = (n: number) => Math.round(n * 100) / 100;

/**
 * SVG path data for a closed outline: smooth quadratics through the midpoints, written as the equivalent cubics, so the
 * path uses only M, C and Z (what Path2D and PDF writers read alike).
 */
export function outlineToPath(outline: Vec[]): string {
  const n = outline.length;
  if (n < 2) return "";
  const mid = (a: Vec, b: Vec): Vec => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let current = mid(outline[n - 1] as Vec, outline[0] as Vec);
  let d = `M${f(current[0])} ${f(current[1])}`;
  for (let i = 0; i < n; i++) {
    const q = outline[i] as Vec;
    const end = mid(q, outline[(i + 1) % n] as Vec);
    const c1 = [current[0] + (2 / 3) * (q[0] - current[0]), current[1] + (2 / 3) * (q[1] - current[1])];
    const c2 = [end[0] + (2 / 3) * (q[0] - end[0]), end[1] + (2 / 3) * (q[1] - end[1])];
    d += `C${f(c1[0] as number)} ${f(c1[1] as number)} ${f(c2[0] as number)} ${f(c2[1] as number)} ${f(end[0])} ${f(end[1])}`;
    current = end;
  }
  return `${d}Z`;
}

/** Path data for one stroke. */
export const inkPath = (stroke: InkStroke, weight: InkWeight) => outlineToPath(inkOutline(stroke, weight));

/** A standalone SVG of the strokes, for saving or placing in a PDF. `width` and `height` are the pad's space. */
export function inkToSvg(
  strokes: InkStroke[],
  options: { width: number; height: number; ink: string; weight: InkWeight },
): string {
  const paths = strokes
    .map((s) => inkPath(s, options.weight))
    .filter(Boolean)
    .map((d) => `<path d="${d}"/>`)
    .join("");
  const fill = options.ink.replace(/[<>"&]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${options.width} ${options.height}" width="${options.width}" height="${options.height}"><g fill="${fill}">${paths}</g></svg>`;
}
