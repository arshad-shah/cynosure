import { describe, expect, it } from "vitest";
import {
  type InkPoint,
  inkOutline,
  inkPath,
  inkPoint,
  inkToSvg,
  outlineToPath,
  penPressure,
  STEADY_PRESSURE,
} from "../../src/components/SignaturePad/ink";

const pt = (x: number, y: number, pressure = STEADY_PRESSURE): InkPoint => ({
  x,
  y,
  pressure,
  tiltX: 0,
  tiltY: 0,
  t: 0,
});

describe("ink", () => {
  it("lifts light pen pressure and eases jitter", () => {
    expect(penPressure(0.1, null)).toBeGreaterThan(0.3);
    expect(penPressure(1, null)).toBeCloseTo(1, 5);
    // Halfway towards the new value from the last one.
    expect(penPressure(1, 0.5)).toBeCloseTo(0.75, 5);
  });

  it("outlines a stroke as a closed band around its line, wider with pressure", () => {
    const line = [pt(0, 0), pt(10, 0), pt(20, 0)];
    const outline = inkOutline(line, "medium");
    const ys = outline.map((p) => p[1]);
    // Above and below the line, and round past both ends.
    expect(Math.min(...ys)).toBeLessThan(-1);
    expect(Math.max(...ys)).toBeGreaterThan(1);
    expect(Math.min(...outline.map((p) => p[0]))).toBeLessThan(0);
    expect(Math.max(...outline.map((p) => p[0]))).toBeGreaterThan(20);
    const heavy = inkOutline([pt(0, 0, 1), pt(10, 0, 1), pt(20, 0, 1)], "medium");
    expect(Math.max(...heavy.map((p) => p[1]))).toBeGreaterThan(Math.max(...ys));
    expect(Math.max(...inkOutline(line, "bold").map((p) => p[1]))).toBeGreaterThan(Math.max(...ys));
  });

  it("draws a dot for a tap and nothing for no points", () => {
    const dot = inkOutline([pt(5, 5)], "thin");
    expect(dot.length).toBeGreaterThan(8);
    for (const [x, y] of dot) expect(Math.hypot(x - 5, y - 5)).toBeLessThan(3);
    expect(inkOutline([], "thin")).toEqual([]);
    expect(outlineToPath([])).toBe("");
  });

  it("writes path data with only M, C and Z, and a standalone SVG", () => {
    const d = inkPath([pt(0, 0), pt(10, 5)], "medium");
    expect(d).toMatch(/^M[-\d. ]+(C[-\d. ]+)+Z$/);
    const svg = inkToSvg([[pt(0, 0), pt(10, 5)]], { width: 600, height: 200, ink: "navy", weight: "thin" });
    expect(svg).toContain('viewBox="0 0 600 200"');
    expect(svg).toContain('fill="navy"');
    expect(svg).toContain("<path d=");
    // The colour cannot break out of its attribute.
    expect(inkToSvg([], { width: 1, height: 1, ink: '"><script>', weight: "thin" })).not.toContain(
      "<script>",
    );
  });

  it("samples pointer events: steady for a mouse, curved and kept on lift-off for a pen", () => {
    const rect = { left: 10, top: 20 } as DOMRect;
    const event = (o: Partial<PointerEvent>) =>
      ({ clientX: 30, clientY: 40, timeStamp: 5, tiltX: 0, tiltY: 0, ...o }) as PointerEvent;
    const mouse = inkPoint(event({ pointerType: "mouse", pressure: 0.9 }), rect, null, { x: 2, y: 2 });
    expect(mouse).toMatchObject({ x: 40, y: 40, pressure: STEADY_PRESSURE, t: 5 });
    const pen = inkPoint(event({ pointerType: "pen", pressure: 1, tiltX: 30 }), rect, null);
    expect(pen.pressure).toBeCloseTo(1, 5);
    expect(pen.tiltX).toBe(30);
    // Lifting off reports 0: the last pressure is kept (or the steady one for a first sample).
    expect(inkPoint(event({ pointerType: "pen", pressure: 0 }), rect, pen).pressure).toBe(pen.pressure);
    expect(inkPoint(event({ pointerType: "pen", pressure: 0 }), rect, null).pressure).toBe(STEADY_PRESSURE);
  });
});
