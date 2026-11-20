/**
 * The geometry of a Facet icon's strokes, for the checks in `tests/unit/icons.test.ts`: no stroke is drawn over
 * another, and a slash keeps clear of what it crosses out. Paths, rects and circles are read into exact lines, cubic
 * curves and elliptical arcs (no browser needed) and sampled along their centre lines. Kept in `tools/` so it never
 * ships.
 */
import type { IconData } from "../src/icons/types";

export type Pt = [number, number];
export type Seg =
  | { k: "L"; p0: Pt; p1: Pt }
  | { k: "C"; p0: Pt; c1: Pt; c2: Pt; p1: Pt }
  | { k: "A"; cx: number; cy: number; rx: number; ry: number; rot: number; t0: number; t1: number };

/** Facet's stroke width, in grid units. */
export const STROKE = 1.75;

function arcSeg(p0: Pt, p1: Pt, rx: number, ry: number, rotDeg: number, large: number, sweep: number): Seg {
  const phi = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (p0[0] - p1[0]) / 2;
  const dy = (p0[1] - p1[1]) / 2;
  const x1 = cos * dx + sin * dy;
  const y1 = -sin * dx + cos * dy;
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const co =
    (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / (rx * rx * y1 * y1 + ry * ry * x1 * x1)));
  const cxp = (co * rx * y1) / ry;
  const cyp = (-co * ry * x1) / rx;
  const angle = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t0 = angle(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
  let dt = angle((x1 - cxp) / rx, (y1 - cyp) / ry, (-x1 - cxp) / rx, (-y1 - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  return {
    k: "A",
    cx: cos * cxp - sin * cyp + (p0[0] + p1[0]) / 2,
    cy: sin * cxp + cos * cyp + (p0[1] + p1[1]) / 2,
    rx,
    ry,
    rot: phi,
    t0,
    t1: t0 + dt,
  };
}

/** A path's subpaths, each a list of absolute segments (Q and T become cubics; H and V lines). */
export function parsePath(d: string): Seg[][] {
  const subs: Seg[][] = [];
  let cur: Seg[] = [];
  let p: Pt = [0, 0];
  let start: Pt = [0, 0];
  let lastC: Pt | null = null;
  let lastQ: Pt | null = null;
  let cmd = "";
  let i = 0;
  const skip = () => {
    while (i < d.length && /[\s,]/.test(d[i] as string)) i++;
  };
  const num = () => {
    skip();
    const m = /^-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/.exec(d.slice(i));
    if (!m) throw new Error(`Expected a number at ${i} in "${d}"`);
    i += m[0].length;
    return Number(m[0]);
  };
  const flag = () => {
    skip();
    return d[i++] === "1" ? 1 : 0;
  };
  const point = (rel: boolean): Pt => {
    const x = num();
    const y = num();
    return rel ? [p[0] + x, p[1] + y] : [x, y];
  };
  for (;;) {
    skip();
    if (i >= d.length) break;
    if (/[A-Za-z]/.test(d[i] as string)) cmd = d[i++] as string;
    const rel = cmd === cmd.toLowerCase();
    const c = cmd.toUpperCase();
    if (c === "M") {
      if (cur.length) subs.push(cur);
      cur = [];
      p = point(rel);
      start = p;
      cmd = rel ? "l" : "L";
      lastC = lastQ = null;
    } else if (c === "Z") {
      if (Math.hypot(p[0] - start[0], p[1] - start[1]) > 1e-6) cur.push({ k: "L", p0: p, p1: start });
      p = start;
      subs.push(cur);
      cur = [];
      lastC = lastQ = null;
    } else if (c === "L" || c === "H" || c === "V") {
      const q: Pt =
        c === "L"
          ? point(rel)
          : c === "H"
            ? [rel ? p[0] + num() : num(), p[1]]
            : [p[0], rel ? p[1] + num() : num()];
      cur.push({ k: "L", p0: p, p1: q });
      p = q;
      lastC = lastQ = null;
    } else if (c === "C" || c === "S") {
      const c1: Pt = c === "C" ? point(rel) : lastC ? [2 * p[0] - lastC[0], 2 * p[1] - lastC[1]] : p;
      const c2 = point(rel);
      const q = point(rel);
      cur.push({ k: "C", p0: p, c1, c2, p1: q });
      lastC = c2;
      lastQ = null;
      p = q;
    } else if (c === "Q" || c === "T") {
      const ctrl: Pt = c === "Q" ? point(rel) : lastQ ? [2 * p[0] - lastQ[0], 2 * p[1] - lastQ[1]] : p;
      const q = point(rel);
      const toCubic = (a: Pt): Pt => [a[0] + (2 / 3) * (ctrl[0] - a[0]), a[1] + (2 / 3) * (ctrl[1] - a[1])];
      cur.push({ k: "C", p0: p, c1: toCubic(p), c2: toCubic(q), p1: q });
      lastQ = ctrl;
      lastC = null;
      p = q;
    } else if (c === "A") {
      const rx = Math.abs(num());
      const ry = Math.abs(num());
      const rot = num();
      const large = flag();
      const sweep = flag();
      const q = point(rel);
      cur.push(arcSeg(p, q, rx, ry, rot, large, sweep));
      p = q;
      lastC = lastQ = null;
    } else throw new Error(`Unknown path command "${cmd}" in "${d}"`);
  }
  if (cur.length) subs.push(cur);
  return subs;
}

/** A body element as path data: rects and circles traced as their outlines. */
export function elementPath(tag: string, attrs: object): string {
  const a = attrs as {
    d?: string;
    cx: number;
    cy: number;
    r: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rx?: number;
  };
  if (tag === "path") return String(a.d);
  if (tag === "circle")
    return `M${a.cx - a.r} ${a.cy}A${a.r} ${a.r} 0 1 1 ${a.cx + a.r} ${a.cy}A${a.r} ${a.r} 0 1 1 ${a.cx - a.r} ${a.cy}Z`;
  const { x, y, width: w, height: h } = a;
  const r = Math.min(a.rx ?? 0, w / 2, h / 2);
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}

/** The point at `t` (0 to 1) along a segment. */
export function pointAt(s: Seg, t: number): Pt {
  if (s.k === "L") return [s.p0[0] + (s.p1[0] - s.p0[0]) * t, s.p0[1] + (s.p1[1] - s.p0[1]) * t];
  if (s.k === "C") {
    const u = 1 - t;
    const at = (k: 0 | 1) =>
      u * u * u * s.p0[k] + 3 * u * u * t * s.c1[k] + 3 * u * t * t * s.c2[k] + t * t * t * s.p1[k];
    return [at(0), at(1)];
  }
  const angle = s.t0 + (s.t1 - s.t0) * t;
  const cos = Math.cos(s.rot);
  const sin = Math.sin(s.rot);
  return [
    s.cx + s.rx * Math.cos(angle) * cos - s.ry * Math.sin(angle) * sin,
    s.cy + s.rx * Math.cos(angle) * sin + s.ry * Math.sin(angle) * cos,
  ];
}

/** Points along a run of segments, about `step` apart. */
export function samplePoints(segs: Seg[], step = 0.1): Pt[] {
  const pts: Pt[] = [];
  for (const s of segs) {
    let length = 0;
    for (let k = 0; k < 16; k++) {
      const a = pointAt(s, k / 16);
      const b = pointAt(s, (k + 1) / 16);
      length += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    const n = Math.max(2, Math.ceil(length / step));
    for (let k = 0; k <= n; k++) pts.push(pointAt(s, k / n));
  }
  return pts;
}

/** The distance from `p` to the segment a–b. */
export function toSegment(p: Pt, a: Pt, b: Pt): number {
  const vx = b[0] - a[0];
  const vy = b[1] - a[1];
  const l2 = vx * vx + vy * vy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vy);
}

const toPolyline = (p: Pt, line: Pt[]) => {
  if (line.length === 1) return Math.hypot(p[0] - (line[0] as Pt)[0], p[1] - (line[0] as Pt)[1]);
  let min = Number.POSITIVE_INFINITY;
  for (let k = 1; k < line.length; k++) min = Math.min(min, toSegment(p, line[k - 1] as Pt, line[k] as Pt));
  return min;
};

/** How far `a`'s centre line runs along `b`'s (within `tol`), leaving out `ends` units at each end of `a` (joins). */
export function lengthAlong(a: Pt[], b: Pt[], tol = 0.35, ends = 0.3): number {
  const at: number[] = [0];
  for (let k = 1; k < a.length; k++)
    at.push(
      (at[k - 1] as number) +
        Math.hypot((a[k] as Pt)[0] - (a[k - 1] as Pt)[0], (a[k] as Pt)[1] - (a[k - 1] as Pt)[1]),
    );
  const total = at[at.length - 1] as number;
  let along = 0;
  for (let k = 1; k < a.length; k++) {
    const s = at[k] as number;
    if (s < ends || s > total - ends) continue;
    if (toPolyline(a[k] as Pt, b) < tol) along += s - (at[k - 1] as number);
  }
  return along;
}

/**
 * Stretches of one stroke drawn over another, longer than `min` units: every pair of segments, other than
 * neighbours that meet at a corner of the same subpath, compared both ways. A line that ends on another (a T-join)
 * overlaps it by under a unit and is not reported.
 */
export function overdraw(icon: Pick<IconData, "body">, min = 1.5): string[] {
  const same = (p: Pt, q: Pt) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-3;
  const subs = icon.body.flatMap(([tag, attrs]) => parsePath(elementPath(tag, attrs)));
  const units = subs.flatMap((segs, si) => segs.map((seg, gi) => ({ si, gi, pts: samplePoints([seg]) })));
  const neighbours = (u: (typeof units)[number], v: (typeof units)[number]) => {
    if (u.si !== v.si) return false;
    const segs = subs[u.si] as Seg[];
    const gap = Math.abs(u.gi - v.gi);
    return (
      gap === 1 ||
      (gap === segs.length - 1 && same(pointAt(segs[0] as Seg, 0), pointAt(segs[segs.length - 1] as Seg, 1)))
    );
  };
  const found: string[] = [];
  for (const u of units)
    for (const v of units) {
      if (u === v || neighbours(u, v)) continue;
      const along = lengthAlong(u.pts, v.pts);
      if (along > min)
        found.push(
          `subpath ${u.si} segment ${u.gi} runs ${along.toFixed(2)} along subpath ${v.si} segment ${v.gi}`,
        );
    }
  return found;
}
