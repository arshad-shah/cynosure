import { afterEach, describe, expect, it, vi } from "vitest";
import { motionMs, transitionTime } from "../../src/foundations/motion";

describe("motionMs", () => {
  const el = {} as Element;
  const stub = (reduced: boolean, slow: string) => {
    vi.stubGlobal("matchMedia", () => ({ matches: reduced }));
    vi.stubGlobal("getComputedStyle", () => ({
      getPropertyValue: (name: string) => (name === "--cy-motion-slow" ? slow : "120ms"),
    }));
  };
  afterEach(() => vi.unstubAllGlobals());
  it("reads the theme's duration token in milliseconds", () => {
    stub(false, "350ms");
    expect(motionMs(el)).toBe(350);
    expect(motionMs(el, "fast")).toBe(120);
  });
  it("is the fallback when the element has no token, and 0 under reduced motion", () => {
    stub(false, "");
    expect(motionMs(el)).toBe(180);
    expect(motionMs(el, "slow", 90)).toBe(90);
    stub(true, "350ms");
    expect(motionMs(el)).toBe(0);
  });
});

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
