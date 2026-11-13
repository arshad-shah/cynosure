import { describe, expect, it } from "vitest";
import {
  CynosureThemeError,
  contrastRatio,
  createTheme,
  type PaletteName,
  resolveColors,
  swiftChartTheme,
  themeProperties,
  themeToCss,
} from "../../src/tokens";
import { mix, parseColor, rgbToOklch } from "../../src/tokens/color";

const PALETTES: PaletteName[] = ["light", "dark", "light-contrast", "dark-contrast"];
const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/;
const ACCENTS = [undefined, "#2563eb", "#facc15", "#16a34a", "#7a5cff", "#00d4ff", "#888888"];

/** Distance in OKLab: about 0.02 is just noticeable; series colours keep well clear of it. */
function distance(a: string, b: string): number {
  const lab = (c: string) => {
    const [l, ch, h] = rgbToOklch(parseColor(c));
    return [l, ch * Math.cos((h * Math.PI) / 180), ch * Math.sin((h * Math.PI) / 180)];
  };
  const [x, y] = [lab(a), lab(b)];
  return Math.hypot(...x.map((v, i) => v - (y[i] as number)));
}

describe("series colours", () => {
  it("are eight, start at the accent and read 3:1 on the page's fills, in every palette and for many accents", () => {
    for (const accent of ACCENTS) {
      const theme = createTheme(accent ? { accent } : {});
      for (const name of PALETTES) {
        const p = theme.palettes[name];
        expect(p.seriesColors).toHaveLength(8);
        if ([p.bg, p.surface, p.surfaceRaised].every((on) => contrastRatio(p.accent, on) >= 3))
          expect(p.seriesColors[0]).toBe(p.accent);
        for (const c of p.seriesColors)
          for (const on of [p.bg, p.surface, p.surfaceRaised])
            expect(contrastRatio(c, on), `${accent} ${name} ${c} on ${on}`).toBeGreaterThanOrEqual(3);
      }
    }
  });
  it("stay distinguishable from each other", () => {
    for (const accent of ACCENTS)
      for (const name of PALETTES) {
        const s = createTheme(accent ? { accent } : {}).palettes[name].seriesColors;
        for (let i = 0; i < s.length; i++)
          for (let j = i + 1; j < s.length; j++)
            expect(distance(s[i] as string, s[j] as string), `${accent} ${name} ${i}/${j}`).toBeGreaterThan(
              0.06,
            );
      }
  });
  it("become --cy-color-series-1 to -8", () => {
    const props = themeProperties(createTheme());
    const { light, dark } = createTheme().palettes;
    expect(props["--cy-color-series-1"]).toBe("#c2410c");
    expect(props["--cy-color-series-2"]).toBe(`light-dark(${light.seriesColors[1]},${dark.seriesColors[1]})`);
    expect(props["--cy-color-series-8"]).toBeDefined();
    expect(props["--cy-color-series-9"]).toBeUndefined();
    expect(themeToCss(createTheme({ mode: "dark" }))).toContain(
      `--cy-color-series-2:${dark.seriesColors[1]}`,
    );
  });
  it("a palette can set all eight; anything else is rejected", () => {
    const own = [
      "#111111",
      "#222222",
      "#333333",
      "#444444",
      "#555555",
      "#666666",
      "#777777",
      "rgb(136 136 136)",
    ];
    const theme = createTheme({ palettes: { dark: { seriesColors: own } } });
    expect(theme.palettes.dark.seriesColors.at(-1)).toBe("#888888");
    expect(theme.palettes.light.seriesColors).toEqual(createTheme().palettes.light.seriesColors);
    expect(() => createTheme({ palettes: { dark: { seriesColors: own.slice(1) } } })).toThrow(
      /eight colours/,
    );
    expect(() => createTheme({ palettes: { dark: { seriesColors: "#111111" as never } } })).toThrow(
      CynosureThemeError,
    );
  });
});

describe("resolveColors", () => {
  it("turns every colour into hex, including the mixed ones, for canvas and chart engines", () => {
    for (const name of PALETTES) {
      const colors = resolveColors(createTheme(), name);
      for (const [key, value] of Object.entries(colors))
        for (const c of Array.isArray(value) ? value : [value]) expect(c, `${name} ${key}`).toMatch(HEX);
    }
    const { light } = createTheme().palettes;
    expect(light.accentSoft).toContain("color-mix(");
    const resolved = resolveColors(createTheme(), "light");
    expect(resolved.ring).toBe(`${light.accent}47`);
    expect(resolved.bg).toBe(light.bg);
    expect(resolveColors()).toEqual(resolved);
  });
  it("resolves the mixes of any theme createTheme builds, and keeps a palette's own accentSoft and ring", () => {
    const themes = [
      ...ACCENTS.map((accent) => createTheme(accent ? { accent } : {})),
      createTheme({ mode: "dark", accent: "#2563eb" }),
      createTheme({ palettes: { light: { surface: "#fdf6e3" }, "dark-contrast": { accent: "#00d4ff" } } }),
    ];
    for (const theme of themes)
      for (const name of PALETTES) {
        const p = theme.palettes[name];
        const resolved = resolveColors(theme, name);
        expect(resolved.accentSoft, name).toBe(mix(p.accent, p.surface, 0.18));
        expect(resolved.ring, name).toBe(`${p.accent}47`);
      }
    const own = createTheme({ palettes: { light: { accentSoft: "#eeeeff", ring: "#123456" } } });
    expect(resolveColors(own, "light")).toMatchObject({ accentSoft: "#eeeeff", ring: "#123456" });
  });
});

describe("swiftChartTheme", () => {
  it("maps a palette to swift-chart's theme shape, every value concrete", () => {
    const theme = createTheme({ accent: "#2563eb" });
    for (const name of PALETTES) {
      const p = theme.palettes[name];
      const chart = swiftChartTheme(theme, name);
      expect(chart).toMatchObject({
        bg: p.bg,
        surface: p.surface,
        axis: p.line,
        text: p.ink,
        textMuted: p.muted,
        positive: p.successText,
        negative: p.dangerText,
        onAccent: p.onAccent,
        colors: p.seriesColors,
        tooltipBg: p.surfaceRaised,
        tooltipBorder: p.line,
        tooltipText: p.ink,
      });
      for (const value of Object.values(chart).flat()) expect(value).toMatch(HEX);
      // Gridlines sit between the line colour and the surface: quieter than the axis.
      expect(contrastRatio(chart.grid, p.surface)).toBeLessThan(contrastRatio(p.line, p.surface));
    }
  });
  it("defaults to Cynosure's light palette", () => {
    expect(swiftChartTheme()).toEqual(swiftChartTheme(createTheme(), "light"));
  });
});
