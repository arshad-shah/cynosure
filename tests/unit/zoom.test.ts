import { describe, expect, it } from "vitest";
import { anchoredScroll, clampPercent, zoomScale, zoomStep } from "../../src/foundations/zoom";

const pages = [
  { width: 600, height: 800 },
  { width: 400, height: 1000 },
];

describe("zoom", () => {
  it("keeps percents between 25 and 800", () => {
    expect(clampPercent(10)).toBe(25);
    expect(clampPercent(123.4)).toBe(123);
    expect(clampPercent(9000)).toBe(800);
  });
  it("steps through the presets", () => {
    expect(zoomStep(100, 1)).toBe(110);
    expect(zoomStep(100, -1)).toBe(90);
    expect(zoomStep(130, -1)).toBe(125);
    expect(zoomStep(130, 1)).toBe(150);
    expect(zoomStep(800, 1)).toBe(800);
    expect(zoomStep(25, -1)).toBe(25);
  });
  it("fits the widest page, or the whole page, inside the viewport", () => {
    const view = { width: 632, height: 532 };
    expect(zoomScale({ kind: "fit-width" }, pages, view, 16)).toBeCloseTo(1, 6);
    expect(zoomScale({ kind: "fit-page" }, pages, view, 16)).toBeCloseTo(0.5, 6);
    expect(zoomScale({ kind: "fit-width", max: 80 }, pages, view, 16)).toBeCloseTo(0.8, 6);
    expect(zoomScale({ kind: "percent", value: 150 }, pages, view)).toBe(1.5);
    // Not measured yet, or no height: 100%, or fit the width.
    expect(zoomScale({ kind: "fit-page" }, pages, { width: 0, height: 0 })).toBe(1);
    expect(zoomScale({ kind: "fit-page" }, pages, { width: 1200, height: 0 })).toBeCloseTo(2, 6);
    // Never below 25% or above 800%.
    expect(zoomScale({ kind: "fit-width" }, pages, { width: 60, height: 0 })).toBe(0.25);
  });
  it("keeps the point under the pointer in place", () => {
    expect(anchoredScroll({ left: 100, top: 200 }, { x: 50, y: 50 }, 2)).toEqual({ left: 250, top: 450 });
  });
});
