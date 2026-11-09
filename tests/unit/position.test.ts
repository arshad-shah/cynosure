import { describe, expect, it } from "vitest";
import { computePosition } from "../../src/overlay/position";

const rect = (left: number, top: number, width = 40, height = 20) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});
const viewport = { width: 800, height: 600 };
const tip = { width: 100, height: 30 };

describe("computePosition", () => {
  it("places below and centred when it fits", () => {
    expect(computePosition(rect(380, 100), tip, viewport, "bottom", 6, "ltr")).toEqual({
      x: 350,
      y: 126,
      placement: "bottom",
    });
  });
  it("places above when asked", () => {
    expect(computePosition(rect(380, 100), tip, viewport, "top", 6, "ltr")).toEqual({
      x: 350,
      y: 64,
      placement: "top",
    });
  });
  it("flips bottom to top near the bottom edge", () => {
    const r = computePosition(rect(380, 570), tip, viewport, "bottom", 6, "ltr");
    expect(r.placement).toBe("top");
    expect(r.y).toBe(570 - 6 - 30);
  });
  it("flips top to bottom near the top edge", () => {
    expect(computePosition(rect(380, 5), tip, viewport, "top", 6, "ltr").placement).toBe("bottom");
  });
  it("shifts inside the viewport on the cross axis", () => {
    expect(computePosition(rect(0, 100), tip, viewport, "bottom", 6, "ltr").x).toBe(8);
    expect(computePosition(rect(780, 100, 20), tip, viewport, "bottom", 6, "ltr").x).toBe(800 - 100 - 8);
  });
  it("maps start and end to physical sides by direction", () => {
    expect(computePosition(rect(400, 300), tip, viewport, "start", 6, "ltr")).toMatchObject({
      x: 400 - 6 - 100,
      placement: "start",
    });
    expect(computePosition(rect(400, 300), tip, viewport, "start", 6, "rtl")).toMatchObject({
      x: 440 + 6,
      placement: "start",
    });
  });
  it("flips end to start when there is no room", () => {
    expect(computePosition(rect(740, 300), tip, viewport, "end", 6, "ltr").placement).toBe("start");
  });
  it("keeps the y inside the viewport for side placements", () => {
    expect(computePosition(rect(400, 590, 40, 8), tip, viewport, "end", 6, "ltr").y).toBe(600 - 30 - 8);
  });
});
