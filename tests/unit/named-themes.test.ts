import { describe, expect, it, vi } from "vitest";
import {
  CynosureThemeError,
  contrastRatio,
  createTheme,
  createThemeRegistry,
  defineTheme,
  type ThemeDefinition,
  themeProperties,
  themeToCss,
} from "../../src/tokens";

const midnight: ThemeDefinition = {
  id: "midnight",
  name: "Midnight",
  mode: "dark",
  accent: "#7a5cff",
  palettes: { dark: { bg: "#05070d", surface: "#0b0f16", surfaceRaised: "#111827" } },
};

describe("a fixed-mode theme", () => {
  it("keeps the same colours whichever mode the page is in", () => {
    const theme = createTheme({ mode: "dark", palettes: { dark: { bg: "#05070d" } } });
    expect(theme.mode).toBe("dark");
    expect(theme.palettes.light).toEqual(theme.palettes.dark);
    expect(theme.palettes["light-contrast"]).toEqual(theme.palettes["dark-contrast"]);
    // No light-dark() pairs: the colour-mode switch has nothing to flip.
    expect(themeProperties(theme)["--cy-color-bg"]).toBe("#05070d");
    expect(themeToCss(theme)).not.toContain("light-dark(");
  });
  it("works for light-only themes too, and a theme without a mode is unchanged", () => {
    const light = createTheme({ mode: "light" });
    expect(light.palettes.dark).toEqual(createTheme().palettes.light);
    expect(createTheme().mode).toBeUndefined();
    expect("mode" in createTheme()).toBe(false);
  });
  it("rejects any other mode", () => {
    expect(() => createTheme({ mode: "dim" as never })).toThrow(CynosureThemeError);
  });
});

describe("defineTheme", () => {
  it("builds the theme and keeps the definition", () => {
    const named = defineTheme(midnight);
    expect(named).toMatchObject({ id: "midnight", name: "Midnight", mode: "dark" });
    expect(named.theme.palettes.light.bg).toBe("#05070d");
    expect(named.theme.palettes.dark.accent).toBe("#7a5cff");
    expect(named.definition).toEqual(midnight);
  });
  it("round-trips through JSON: a plugin's JSON builds the same theme", () => {
    const json = JSON.stringify(defineTheme(midnight).definition);
    expect(defineTheme(JSON.parse(json)).theme).toEqual(defineTheme(midnight).theme);
    expect(defineTheme(JSON.parse(json)).theme).toEqual(createTheme(midnight));
  });
  it.each([
    ["not an object", "midnight", /must be an object/],
    ["an array", [], /must be an object/],
    ["no id", { name: "x" }, /id/],
    ["a bad id", { id: "Mid night", name: "x" }, /id/],
    ["no name", { id: "x" }, /name/],
    ["an empty name", { id: "x", name: " " }, /name/],
    ["an unknown field", { id: "x", name: "x", css: "body{}" }, /css/],
    ["a non-string accent", { id: "x", name: "x", accent: 3 }, /accent/],
    ["a bad colour", { id: "x", name: "x", accent: "blurple" }, /blurple/],
    ["a nested object where a value belongs", { id: "x", name: "x", font: { sans: { a: 1 } } }, /font/],
    ["a function value", { id: "x", name: "x", radius: () => 1 }, /radius/],
    ["a prototype key", JSON.parse('{"id":"x","name":"x","tokens":{"__proto__":{"a":1}}}'), /__proto__/],
    ["an unsafe value", { id: "x", name: "x", font: { sans: "a;}body{color:red" } }, /unsafe/],
    ["an unknown palette", { id: "x", name: "x", palettes: { dim: {} } }, /dim/],
    ["a bad mode", { id: "x", name: "x", mode: "auto" }, /mode/],
    [
      "palettes that are not an object",
      { id: "x", name: "x", palettes: "dark" },
      /palettes must be an object/,
    ],
    [
      "a palette that is not an object",
      { id: "x", name: "x", palettes: { dark: 1 } },
      /dark must be an object/,
    ],
    ["a list where a colour belongs", { id: "x", name: "x", palettes: { dark: { bg: ["#000"] } } }, /bg/],
    [
      "series that are not colours",
      { id: "x", name: "x", palettes: { dark: { seriesColors: [1] } } },
      /series/,
    ],
    ["one series colour", { id: "x", name: "x", palettes: { dark: { seriesColors: ["#000"] } } }, /eight/],
    [
      "a component token that is an object",
      { id: "x", name: "x", components: { button: { radius: {} } } },
      /radius/,
    ],
    [
      "a token of the wrong type",
      { id: "x", name: "x", tokens: { space: { "4": "10px" } } },
      /must be a number/,
    ],
    ["an unknown token", { id: "x", name: "x", tokens: { spice: 1 } }, /spice/],
    ["a motion word other than reduced", { id: "x", name: "x", motion: "slow" }, /motion must be an object/],
  ])("rejects %s with CynosureThemeError", (_, input, message) => {
    expect(() => defineTheme(input)).toThrow(CynosureThemeError);
    expect(() => defineTheme(input)).toThrow(message);
  });
  it("rejects themes whose text does not read on their surfaces", () => {
    const grey = { id: "grey", name: "Grey", mode: "dark", palettes: { dark: { ink: "#3a3a3a" } } };
    expect(() => defineTheme(grey)).toThrow(/ink.*4\.5:1/);
    const muted = { id: "m", name: "M", palettes: { light: { muted: "#d0d0d0" } } };
    expect(() => defineTheme(muted)).toThrow(/light palette: muted/);
    // A light-only theme does not check the dark palette it never shows.
    expect(
      defineTheme({ id: "l", name: "L", mode: "light", palettes: { dark: { ink: "#222222" } } }).id,
    ).toBe("l");
  });
  it("accepts the built-in theme and every built-in palette reads", () => {
    const named = defineTheme({ id: "cynosure", name: "Cynosure" });
    for (const p of Object.values(named.theme.palettes)) {
      expect(contrastRatio(p.ink, p.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.onAccent, p.accent)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("createThemeRegistry", () => {
  it("registers, lists, gets and unregisters themes, in order", () => {
    const themes = createThemeRegistry([{ id: "ion", name: "Ion", mode: "dark" }]);
    themes.register(midnight);
    expect(themes.list().map((t) => t.id)).toEqual(["ion", "midnight"]);
    expect(themes.get("midnight")?.theme.mode).toBe("dark");
    expect(themes.get("nope")).toBeUndefined();
    expect(themes.unregister("ion")).toBe(true);
    expect(themes.unregister("ion")).toBe(false);
    expect(themes.list().map((t) => t.id)).toEqual(["midnight"]);
  });
  it("replaces a theme registered again under the same id, keeping its place", () => {
    const themes = createThemeRegistry([midnight, { id: "paper", name: "Paper", mode: "light" }]);
    themes.register({ ...midnight, name: "Midnight 2" });
    expect(themes.list().map((t) => t.name)).toEqual(["Midnight 2", "Paper"]);
  });
  it("tells subscribers about every change, and stops when they unsubscribe", () => {
    const themes = createThemeRegistry();
    const listener = vi.fn();
    const stop = themes.subscribe(listener);
    themes.register(midnight);
    themes.unregister("midnight");
    themes.unregister("midnight");
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
    themes.register(midnight);
    expect(listener).toHaveBeenCalledTimes(2);
  });
  it("keeps the list stable between changes (safe for useSyncExternalStore)", () => {
    const themes = createThemeRegistry([midnight]);
    expect(themes.list()).toBe(themes.list());
    const before = themes.list();
    themes.register({ id: "paper", name: "Paper" });
    expect(themes.list()).not.toBe(before);
  });
  it("rejects bad input without changing the registry or telling subscribers", () => {
    const themes = createThemeRegistry([midnight]);
    const listener = vi.fn();
    themes.subscribe(listener);
    expect(() => themes.register({ id: "midnight", name: "Broken", accent: "nope" })).toThrow(
      CynosureThemeError,
    );
    expect(themes.get("midnight")?.name).toBe("Midnight");
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("definitions that use every field", () => {
  it("are accepted when each field has the right type", () => {
    const named = defineTheme({
      id: "full",
      name: "Full",
      accent: "oklch(0.6 0.2 280)",
      scale: "compact",
      radius: 0.5,
      font: { sans: "Inter, system-ui" },
      motion: "reduced",
      tokens: { space: { "4": 10 }, shadow: { sm: "none" } },
      palettes: { light: { seriesColors: Array(8).fill("#2563eb") } },
      components: { button: { radius: "4px", gap: 6 } },
    });
    expect(named.theme.global.scale).toBe(0.875);
    expect(named.theme.components.button).toEqual({ radius: "4px", gap: "6" });
    expect(defineTheme({ id: "n", name: "N", scale: 1.1, motion: { base: 90 } }).theme.global.scale).toBe(
      1.1,
    );
    expect("mode" in named).toBe(false);
  });
});
