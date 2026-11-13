import { describe, expect, it } from "vitest";
import { edgeProps, isTone, toneColour } from "../../src/foundations/edge";
import { TONES } from "../../src/tokens/schema";

describe("toneColour", () => {
  it("turns each tone into its colour token, the ink for neutral", () => {
    expect(TONES.map(toneColour)).toEqual([
      "var(--cy-color-accent)",
      "var(--cy-color-ink)",
      "var(--cy-color-danger)",
      "var(--cy-color-success)",
      "var(--cy-color-warning)",
      "var(--cy-color-info)",
    ]);
  });

  it("returns any other value as the CSS colour it is", () => {
    expect(toneColour("#ff00aa")).toBe("#ff00aa");
    expect(isTone("muted")).toBe(false);
    expect(isTone("info")).toBe(true);
  });
});

describe("edgeProps", () => {
  it("marks a tone by name and a CSS colour as custom, keeping the caller's style", () => {
    expect(edgeProps("neutral", { margin: 0 })).toEqual({
      "data-edge": "neutral",
      style: { "--_edge": "var(--cy-color-ink)", margin: 0 },
    });
    expect(edgeProps("rebeccapurple", undefined)).toEqual({
      "data-edge": "custom",
      style: { "--_edge": "rebeccapurple" },
    });
    expect(edgeProps(undefined, { margin: 0 })).toEqual({ "data-edge": undefined, style: { margin: 0 } });
  });
});
