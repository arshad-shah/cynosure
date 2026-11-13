import { describe, expect, it } from "vitest";
import { alignedScroll } from "../../src/foundations/scroll-align";

// A view 100 long scrolled to 200 shows 200 to 300.
describe("alignedScroll", () => {
  it("nearest leaves a span already in view where it is", () => {
    expect(alignedScroll(200, 100, 220, 30)).toBe(200);
    expect(alignedScroll(200, 100, 200, 100, "nearest")).toBe(200);
  });
  it("nearest scrolls the least that shows a span above or below the view", () => {
    expect(alignedScroll(200, 100, 150, 30)).toBe(150);
    expect(alignedScroll(200, 100, 290, 30)).toBe(220);
  });
  it("nearest shows the start of a span longer than the view", () => {
    expect(alignedScroll(200, 100, 250, 300)).toBe(250);
    expect(alignedScroll(200, 100, 50, 300)).toBe(50);
  });
  it("start and center place the span whatever the view shows now", () => {
    expect(alignedScroll(200, 100, 220, 30, "start")).toBe(220);
    expect(alignedScroll(200, 100, 220, 30, "center")).toBe(185);
  });
  it("measured from the view (at 0) it is the distance to scroll", () => {
    expect(alignedScroll(0, 100, -50, 30)).toBe(-50);
    expect(alignedScroll(0, 100, 90, 30)).toBe(20);
    expect(alignedScroll(0, 100, 20, 30)).toBe(0);
  });
});
