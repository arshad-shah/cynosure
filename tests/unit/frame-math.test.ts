import { describe, expect, it } from "vitest";
import {
  angleFrom,
  contain,
  moveBy,
  resizeBy,
  resizeByKey,
} from "../../src/components/SelectionFrame/frame-math";

const box = { x: 10, y: 10, width: 100, height: 50 };
const limits = { minSize: 1 };
const close = (a: object, b: object) => {
  for (const [k, v] of Object.entries(b))
    expect((a as Record<string, number>)[k]).toBeCloseTo(v as number, 6);
};

describe("frame math", () => {
  it("moves and stays inside its bounds", () => {
    expect(moveBy(box, 5, -3, limits)).toEqual({ ...box, x: 15, y: 7 });
    expect(moveBy(box, -50, 500, { minSize: 1, bounds: { width: 200, height: 100 } })).toEqual({
      ...box,
      x: 0,
      y: 50,
    });
    expect(contain(box, limits)).toBe(box);
  });

  it("resizes from any handle with the opposite side fixed", () => {
    close(resizeBy(box, "se", 20, 10, 0, false, limits), { x: 10, y: 10, width: 120, height: 60 });
    close(resizeBy(box, "nw", 20, 10, 0, false, limits), { x: 30, y: 20, width: 80, height: 40 });
    close(resizeBy(box, "n", 99, 10, 0, false, limits), { x: 10, y: 20, width: 100, height: 40 });
    // Never smaller than the minimum.
    expect(resizeBy(box, "e", -500, 0, 0, false, { minSize: 8 }).width).toBe(8);
  });

  it("keeps the aspect ratio when asked", () => {
    close(resizeBy(box, "se", 100, 0, 0, true, limits), { width: 200, height: 100 });
    close(resizeBy(box, "e", 50, 0, 0, true, limits), { width: 150, height: 75 });
    close(resizeBy(box, "s", 0, 25, 0, true, limits), { width: 150, height: 75 });
    close(resizeBy(box, "se", 0, 50, 0, true, limits), { width: 200, height: 100 });
  });

  it("reads a drag in the box's own axes when rotated", () => {
    // Turned a quarter clockwise, its own right edge faces down: dragging "e" downwards widens it.
    const r = resizeBy(box, "e", 0, 20, 90, false, limits);
    expect(r.width).toBeCloseTo(120, 6);
    expect(r.height).toBeCloseTo(50, 6);
    // The centre moved down by half the growth, so the far edge stayed put.
    expect(r.y + r.height / 2).toBeCloseTo(box.y + box.height / 2 + 10, 6);
  });

  it("stops an unrotated edge at the bounds", () => {
    const b = { minSize: 1, bounds: { width: 150, height: 100 } };
    close(resizeBy(box, "e", 500, 0, 0, false, b), { x: 10, width: 140 });
  });

  it("resizes from the keyboard along its own sides", () => {
    close(resizeByKey(box, "ArrowRight", 10, 0, false, limits), { width: 110, height: 50 });
    close(resizeByKey(box, "ArrowUp", 10, 0, false, limits), { width: 100, height: 40 });
    expect(resizeByKey(box, "Enter", 10, 0, false, limits)).toBe(box);
  });

  it("measures angles clockwise from straight up", () => {
    expect(angleFrom(0, 0, 0, -10)).toBeCloseTo(0, 6);
    expect(angleFrom(0, 0, 10, 0)).toBeCloseTo(90, 6);
    expect(angleFrom(0, 0, -10, 0)).toBeCloseTo(270, 6);
  });
});
