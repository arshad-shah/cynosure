import { clamp } from "../../foundations/math.js";
/**
 * Geometry for SelectionFrame, in the frame's own units (page points, canvas pixels…). Pure functions, so the pointer
 * and keyboard paths agree and can be tested without a browser. Rotation is in degrees, clockwise, about the centre.
 */

export interface FrameBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type FrameHandle = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
export interface FrameLimits {
  /** Smallest width and height. */
  minSize: number;
  /** Keep the box inside this area (ignored while rotated: a rotated box is clamped by its centre). */
  bounds?: { width: number; height: number } | undefined;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const rot = (x: number, y: number, deg: number): [number, number] => {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [x * c - y * s, x * s + y * c];
};

/** Keeps a box inside its bounds, moving it rather than shrinking it. */
export function contain(box: FrameBox, limits: FrameLimits): FrameBox {
  const b = limits.bounds;
  if (!b) return box;
  return { ...box, x: clamp(box.x, 0, b.width - box.width), y: clamp(box.y, 0, b.height - box.height) };
}

/** The box moved by (dx, dy) units. */
export const moveBy = (box: FrameBox, dx: number, dy: number, limits: FrameLimits): FrameBox =>
  contain({ ...box, x: box.x + dx, y: box.y + dy }, limits);

/**
 * The box resized by dragging `handle` by (dx, dy) units on screen. The drag is read in the box's own (rotated) axes
 * and the opposite edge or corner stays where it is. `keepAspect` keeps the width-to-height ratio.
 */
export function resizeBy(
  box: FrameBox,
  handle: FrameHandle,
  dx: number,
  dy: number,
  rotate: number,
  keepAspect: boolean,
  limits: FrameLimits,
): FrameBox {
  const [lx, ly] = rot(dx, dy, -rotate);
  const sx = handle.includes("e") ? 1 : handle.includes("w") ? -1 : 0;
  const sy = handle.includes("s") ? 1 : handle.includes("n") ? -1 : 0;
  let width = Math.max(limits.minSize, box.width + sx * lx);
  let height = Math.max(limits.minSize, box.height + sy * ly);
  if (keepAspect) {
    const ratio = box.width / box.height;
    // Corners follow the larger change; an edge carries the other side with it.
    if (sx && sy) {
      if (width / box.width > height / box.height) height = width / ratio;
      else width = height * ratio;
    } else if (sx) height = width / ratio;
    else width = height * ratio;
  }
  // The anchor (the opposite side) stays put: shift the centre by half the growth, in the box's axes.
  const growX = width - box.width;
  const growY = height - box.height;
  const [cx, cy] = rot((sx * growX) / 2, (sy * growY) / 2, rotate);
  const centreX = box.x + box.width / 2 + cx;
  const centreY = box.y + box.height / 2 + cy;
  const next = { x: centreX - width / 2, y: centreY - height / 2, width, height };
  if (!limits.bounds || rotate % 360 !== 0) return next;
  // Unrotated: the grabbed edge stops at the bounds instead of pushing the box.
  const b = limits.bounds;
  const left = Math.max(0, next.x);
  const top = Math.max(0, next.y);
  const right = Math.min(b.width, next.x + next.width);
  const bottom = Math.min(b.height, next.y + next.height);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/**
 * The box resized from the keyboard: arrows grow or shrink its own right and bottom edges by `step` (in the box's axes,
 * so a rotated box grows along its own sides).
 */
export function resizeByKey(
  box: FrameBox,
  key: string,
  step: number,
  rotate: number,
  keepAspect: boolean,
  limits: FrameLimits,
) {
  const delta: Record<string, [FrameHandle, number, number]> = {
    ArrowRight: ["e", step, 0],
    ArrowLeft: ["e", -step, 0],
    ArrowDown: ["s", 0, step],
    ArrowUp: ["s", 0, -step],
  };
  const d = delta[key];
  if (!d) return box;
  const [dx, dy] = rot(d[1], d[2], rotate);
  return resizeBy(box, d[0], dx, dy, rotate, keepAspect, limits);
}

/** The angle (degrees, 0 = straight up, clockwise) from a centre to a point: where a rotate handle points. */
export function angleFrom(cx: number, cy: number, x: number, y: number) {
  const deg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
  return ((deg % 360) + 360) % 360;
}
