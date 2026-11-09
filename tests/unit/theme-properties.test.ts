import { describe, expect, it } from "vitest";
import { contrastRatio, createTheme, themeProperties } from "../../src/tokens";

describe("themeProperties", () => {
  it("emits global, colour and component properties", () => {
    const props = themeProperties(createTheme({ components: { button: { radius: "4px" } } }));
    expect(props["--cy-control-height-md"]).toBe("32px");
    expect(props["--cy-motion-base"]).toBe("200ms");
    expect(props["--cy-radius-factor"]).toBe("0.3");
    expect(props["--cy-star-visible"]).toBe("1");
    expect(props["--cy-button-radius"]).toBe("4px");
  });
  it("emits 0 for a hidden star", () => {
    expect(themeProperties(createTheme({ star: false }))["--cy-star-visible"]).toBe("0");
  });
  it("swaps in the high-contrast palettes", () => {
    const props = themeProperties(createTheme(), { contrast: true });
    const [light] = /light-dark\(([^,]+),/.exec(props["--cy-color-muted"] ?? "")?.slice(1) ?? [];
    expect(contrastRatio(light ?? "#fff", "#f4f1ea")).toBeGreaterThanOrEqual(7);
  });
});
