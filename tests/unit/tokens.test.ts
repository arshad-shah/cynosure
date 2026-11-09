import { describe, expect, it } from "vitest";
import { CynosureThemeError, contrastRatio, createTheme, themeToCss } from "../../src/tokens";

describe("default palettes (approved Facet values)", () => {
  it("light palette matches", () => {
    const { light } = createTheme().palettes;
    expect([light.bg, light.surface, light.ink, light.muted, light.line, light.soft]).toEqual([
      "#f4f1ea",
      "#fbf9f5",
      "#1d1b18",
      "#6b665e",
      "#dcd6cb",
      "#ebe6dc",
    ]);
  });
  it("dark palette matches", () => {
    const { dark } = createTheme().palettes;
    expect([dark.bg, dark.surface, dark.ink, dark.muted, dark.line, dark.soft]).toEqual([
      "#14120f",
      "#1d1a16",
      "#ece8e1",
      "#a39d93",
      "#34302a",
      "#28241f",
    ]);
  });
  it("contrast palettes raise muted text to at least 7:1 against the background", () => {
    const p = createTheme().palettes;
    expect(contrastRatio(p["light-contrast"].muted, p["light-contrast"].bg)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p["dark-contrast"].muted, p["dark-contrast"].bg)).toBeGreaterThanOrEqual(7);
  });
});

describe("scale and radius", () => {
  const md = (scale?: Parameters<typeof createTheme>[0]) => createTheme(scale).global.control.height.md;
  it("scale multiplies control height", () => {
    expect(md()).toBe(32);
    expect(md({ scale: "compact" })).toBe(28);
    expect(md({ scale: "spacious" })).toBeCloseTo(38.4);
    expect(md({ scale: 1.5 })).toBe(48);
  });
  it("control radius is 0.3 x control height", () => {
    expect(createTheme().global.radius.md).toBeCloseTo(9.6);
    expect(createTheme({ radius: 0 }).global.radius.md).toBe(0);
  });
});

describe("accent", () => {
  it.each(["#e8462e", "#d4a843", "#4f7bd9", "#14b8a6", "#ffffff", "#000000", "oklch(0.7 0.3 90)"])(
    "on-accent text meets 4.5:1 for %s",
    (accent) => {
      const { light } = createTheme({ accent }).palettes;
      expect(contrastRatio(light.onAccent, light.accent)).toBeGreaterThanOrEqual(4.5);
    },
  );
  it("derives a darker hover and active from the accent", () => {
    const { light } = createTheme({ accent: "#4f7bd9" }).palettes;
    expect(contrastRatio(light.accentHover, "#ffffff")).toBeGreaterThan(
      contrastRatio(light.accent, "#ffffff"),
    );
    expect(contrastRatio(light.accentActive, "#ffffff")).toBeGreaterThan(
      contrastRatio(light.accentHover, "#ffffff"),
    );
  });
  it("invalid accent throws CynosureThemeError naming the input", () => {
    expect(() => createTheme({ accent: "nope" })).toThrow(CynosureThemeError);
    expect(() => createTheme({ accent: "nope" })).toThrow(/nope/);
  });
});

describe("themeToCss", () => {
  const css = themeToCss(createTheme({ accent: "#14b8a6", components: { button: { radius: "2px" } } }));
  const firstBlock = css.slice(0, css.indexOf("}"));
  it("emits every token once in the base block under the default selector", () => {
    expect(firstBlock.startsWith(":where(:root,:host,.cy-theme){")).toBe(true);
    const names = [...firstBlock.matchAll(/(--cy-[a-z0-9-]+):/g)].map((m) => m[1]);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain("--cy-color-accent");
    expect(names).toContain("--cy-control-height-md");
  });
  it("uses light-dark() so system mode follows the OS and data-cy-mode overrides it", () => {
    expect(firstBlock).toContain("--cy-color-bg:light-dark(#f4f1ea,#14120f)");
    expect(css).toContain('[data-cy-mode="dark"]');
    expect(css).toContain("@media (prefers-contrast:more)");
    expect(css).toContain('[data-cy-contrast="more"]');
  });
  it("root follows the OS for mode and contrast when no attribute is set", () => {
    expect(css).toContain(":where(:root,:host){color-scheme:light dark}");
    expect(css).toMatch(
      /@media \(prefers-contrast:more\)\{:where\(:root:not\(\[data-cy-contrast\]\),:host,\[data-cy-contrast="system"\]\)\{/,
    );
  });
  it("emits component token overrides", () => {
    expect(firstBlock).toContain("--cy-button-radius:2px");
  });
  it("accepts a custom selector", () => {
    expect(themeToCss(createTheme(), ".app").startsWith(".app{")).toBe(true);
  });
  it("reduced motion zeroes durations", () => {
    const reduced = createTheme({ motion: "reduced" }).global.motion;
    expect([reduced.fast, reduced.base, reduced.slow]).toEqual([0, 0, 0]);
    expect(themeToCss(createTheme({ motion: "reduced" }))).toContain("--cy-motion-base:0ms");
  });
});
