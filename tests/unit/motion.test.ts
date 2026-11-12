import { describe, expect, it } from "vitest";
import { transitionTime } from "../../src/foundations/motion";

const style = (transitionDuration: string, transitionDelay: string) => ({
  transitionDuration,
  transitionDelay,
});

describe("transitionTime", () => {
  it("is the longest duration plus its own delay, in milliseconds", () => {
    expect(transitionTime(style("0.2s", "0s"))).toBe(200);
    // Not only the first entry: the second property runs longer.
    expect(transitionTime(style("0.2s, 0.5s", "0s, 0s"))).toBe(500);
    expect(transitionTime(style("0.2s, 0.2s", "0s, 0.1s"))).toBe(300);
    // Lists of different lengths: every pairing counts, so the wait is never short.
    expect(transitionTime(style("0.1s, 0.3s", "0.05s, 0s, 0.2s"))).toBe(500);
    expect(transitionTime(style("150ms", "50ms"))).toBe(200);
  });
  it("is zero with no transition, and never negative", () => {
    expect(transitionTime(style("0s", "0s"))).toBe(0);
    expect(transitionTime(style("", ""))).toBe(0);
    expect(transitionTime(style("0.1s", "-0.5s"))).toBe(0);
  });
});
