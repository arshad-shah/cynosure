import { describe, expect, it } from "vitest";
import { CynosureThemeError, contrastRatio, createTheme, themeToCss } from "../../src/tokens";
import { mix, parseColor, rgbToOklch } from "../../src/tokens/color";

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
  it("the dense xs control height is 20px and scales like the others", () => {
    expect(createTheme().global.control.height.xs).toBe(20);
    expect(createTheme({ scale: "compact" }).global.control.height.xs).toBe(17.5);
    expect(themeToCss(createTheme())).toContain("--cy-control-height-xs:20px");
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
  it.each(["#e8462e", "#4f7bd9", "#808080", "#d0612a", "#d4a843", "#14b8a6"])(
    "on-accent text keeps 4.5:1 on hover and active fills for %s",
    (accent) => {
      for (const p of [createTheme({ accent }).palettes.light, createTheme({ accent }).palettes.dark]) {
        expect(contrastRatio(p.onAccent, p.accentHover)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(p.onAccent, p.accentActive)).toBeGreaterThanOrEqual(4.5);
        expect(p.accentHover).not.toBe(p.accent);
      }
    },
  );
  it("invalid accent throws CynosureThemeError naming the input", () => {
    expect(() => createTheme({ accent: "nope" })).toThrow(CynosureThemeError);
    expect(() => createTheme({ accent: "nope" })).toThrow(/nope/);
  });
});

describe("themeToCss", () => {
  const css = themeToCss(createTheme({ accent: "#14b8a6", components: { button: { radius: "2px" } } }));
  const firstBlock = css.slice(0, css.indexOf("}"));
  it("emits every token once in the base block under the default selector", () => {
    expect(firstBlock.startsWith(":where(:root,:host){")).toBe(true);
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
    expect(css).not.toMatch(/:root[^{]*\{color-scheme/);
    expect(css).toMatch(
      /@media \(prefers-contrast:more\)\{:where\(:root:not\(\[data-cy-contrast\]\),:host,\[data-cy-contrast="system"\]\)\{/,
    );
  });
  it('contrast="normal" puts the normal palettes back on an OS set to more contrast', () => {
    const block = css.slice(css.indexOf("@media (prefers-contrast:more)"));
    const normal = block.indexOf(':where([data-cy-contrast="normal"]){');
    // After the rule that swaps the contrast palettes in, so it wins for a wrapper that inherits them from the root.
    expect(normal).toBeGreaterThan(block.indexOf(":where(:root:not([data-cy-contrast])"));
    const rule = block.slice(normal, block.indexOf("}", normal));
    expect(rule).toContain("--cy-color-bg:light-dark(#f4f1ea,#14120f)");
    expect(rule).toContain(`--cy-color-muted:${firstBlock.match(/--cy-color-muted:([^;]+)/)?.[1]}`);
    // Colours only: global and component tokens stay inherited.
    expect(rule).not.toContain("--cy-button-radius");
    expect(rule).not.toContain("--cy-space");
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

describe("untrusted-looking theme input", () => {
  it("rejects token values that could break out of a style block", () => {
    expect(() => createTheme({ components: { button: { radius: "2px}body{display:none" } } })).toThrow(
      CynosureThemeError,
    );
    expect(() => createTheme({ components: { button: { radius: "</style><script>" } } })).toThrow(
      CynosureThemeError,
    );
    expect(() => createTheme({ components: { "bad name;": { radius: "2px" } } })).toThrow(CynosureThemeError);
    expect(() => createTheme({ font: { sans: "x;}*{color:red" } })).toThrow(CynosureThemeError);
  });
  it("validates every path into the theme, including generic token overrides and key names", () => {
    expect(() => createTheme({ tokens: { motion: { ease: "x;}*{color:red" } } })).toThrow(CynosureThemeError);
    expect(() => createTheme({ motion: { ease: "</style>" } })).toThrow(CynosureThemeError);
    expect(() => createTheme({ tokens: { "bad;key": 1 } as never })).toThrow(CynosureThemeError);
    expect(() => createTheme({ palettes: { light: { "evil}": "#fff" } as never } })).toThrow(
      CynosureThemeError,
    );
    expect(() => createTheme({ palettes: { weird: { bg: "#fff" } } as never })).toThrow(CynosureThemeError);
    expect(() => createTheme({ font: { "x;y": "serif" } as never })).toThrow(CynosureThemeError);
  });
  it("validates every palette override as a colour", () => {
    expect(() => createTheme({ palettes: { light: { bg: "red;}" } } })).toThrow(CynosureThemeError);
    expect(createTheme({ palettes: { light: { bg: "rgb(10 20 30)" } } }).palettes.light.bg).toBe("#0a141e");
  });
  it("resolves extreme chroma quickly instead of looping", () => {
    const started = performance.now();
    const { light } = createTheme({ accent: "oklch(0.5 1000000000 0)" }).palettes;
    expect(performance.now() - started).toBeLessThan(50);
    expect(contrastRatio(light.onAccent, light.accent)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("colour input formats", () => {
  it.each([
    ["#f80", "#ff8800"],
    ["#ff8800cc", "#ff8800"],
    ["rgb(255 136 0)", "#ff8800"],
    ["rgb(100%, 53.33%, 0%)", "#ff8800"],
    ["hsl(32 100% 50%)", "#ff8800"],
    ["rgba(255, 136, 0, 0.5)", "#ff8800"],
  ])("reads %s as the accent", (input, hex) => {
    expect(createTheme({ accent: input }).palettes.light.accent).toBe(hex);
  });
  it("reads oklch with percentage lightness", () => {
    expect(createTheme({ accent: "oklch(70% 0.15 50)" }).palettes.light.accent).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("theme options", () => {
  it("font families and partial motion override defaults", () => {
    const t = createTheme({ font: { sans: "Hanken Grotesk, system-ui" }, motion: { base: 90 } });
    expect(t.global.font.sans).toBe("Hanken Grotesk, system-ui");
    expect([t.global.motion.base, t.global.motion.fast]).toEqual([90, 120]);
  });
  it("generic token overrides deep-merge", () => {
    const t = createTheme({ tokens: { space: { "4": 10 }, z: { tooltip: 9 } } });
    expect([t.global.space["4"], t.global.space["5"], t.global.z.tooltip]).toEqual([10, 12, 9]);
  });
  it("rejects invalid component token names", () => {
    expect(() => createTheme({ components: { button: { "bad key": "1px" } as never } })).toThrow(/bad key/);
  });
  it("rejects oklch with non-numeric parts", () => {
    expect(() => createTheme({ accent: "oklch(a b c)" })).toThrow(CynosureThemeError);
  });
  it("rejects unknown palette colours and palette names", () => {
    expect(() => createTheme({ palettes: { light: { nope: "#fff" } as never } })).toThrow(/nope/);
  });
});

describe("themeToCss with a custom selector", () => {
  it("scopes mode and contrast rules to that selector", () => {
    const css = themeToCss(createTheme(), ".app");
    expect(css).toContain('.app[data-cy-mode="dark"]{color-scheme:dark}');
    expect(css).toContain('@media (prefers-contrast:more){.app[data-cy-contrast="system"]{');
    expect(css).toContain(
      '.app[data-cy-contrast="system"] [data-cy-contrast="normal"]{--cy-color-bg:light-dark(#f4f1ea,#14120f)',
    );
  });
});

describe("readability and distinct roles", () => {
  it("prefers white on-accent text whenever it passes 4.5:1 on every fill", () => {
    for (const accent of [undefined, "#c2410c", "#2563eb", "#be123c"]) {
      const p = createTheme(accent ? { accent } : {}).palettes.light;
      expect(p.onAccent).toBe("#ffffff");
    }
  });
  it("keeps dark text where white would fail", () => {
    expect(createTheme({ accent: "#d4a843" }).palettes.light.onAccent).not.toBe("#ffffff");
  });
  it("danger is a clearly different hue from the default accent", () => {
    const { light, dark } = createTheme().palettes;
    for (const p of [light, dark]) {
      const hue = (hex: string) => rgbToOklch(parseColor(hex))[2];
      const diff = Math.abs(hue(p.danger) - hue(p.accent));
      expect(Math.min(diff, 360 - diff)).toBeGreaterThanOrEqual(25);
    }
  });
});

describe("tone text roles", () => {
  const tones = ["accent", "danger", "success", "warning", "info"] as const;
  it.each(["#c2410c", "#e8462e", "#d4a843", "#14b8a6", "#2563eb"])(
    "tone text reaches 4.5:1 on its strongest soft tint and on the surface for accent %s",
    (accent) => {
      for (const p of [createTheme({ accent }).palettes.light, createTheme({ accent }).palettes.dark]) {
        for (const tone of tones) {
          const text = p[`${tone}Text`];
          expect(contrastRatio(text, mix(p[tone], p.surface, 0.24))).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(text, p.surface)).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );
});

describe("review minors", () => {
  it("M1: garbage inside rgb()/hsl() names the original input", () => {
    expect(() => createTheme({ accent: "rgb(x y z)" })).toThrow(/rgb\(x y z\)/);
    expect(() => createTheme({ accent: "hsl(foo, 10%, 10%)" })).toThrow(/hsl\(foo/);
  });
  it("M3: scale must be a finite number between 0.5 and 3", () => {
    for (const scale of [Number.NaN, -1, 0, 10, Number.POSITIVE_INFINITY])
      expect(() => createTheme({ scale })).toThrow(CynosureThemeError);
    expect(createTheme({ scale: 0.5 }).global.control.height.md).toBe(16);
  });
  it("M4: radius follows overridden control heights", () => {
    const t = createTheme({ tokens: { control: { height: { md: 40 } } } });
    expect(t.global.control.height.md).toBe(40);
    expect(t.global.radius.md).toBeCloseTo(12);
  });
  it("M5: selector lists stay valid in scoped mode and contrast rules", () => {
    const css = themeToCss(createTheme(), ".a, .b");
    expect(css).toContain(':is(.a, .b)[data-cy-mode="dark"]{color-scheme:dark}');
    expect(css).not.toContain('.b[data-cy-mode="dark"]');
  });
});

describe("remaining theme branches", () => {
  it("explicit radius overrides are kept even when heights change", () => {
    const t = createTheme({ tokens: { control: { height: { md: 40 } }, radius: { md: 3 } } });
    expect(t.global.radius.md).toBe(3);
    expect(t.global.radius.lg).toBeCloseTo(12);
  });
  it("undefined values in overrides keep the defaults", () => {
    const t = createTheme({
      tokens: { space: { "4": undefined } },
      components: { button: undefined },
    } as never);
    expect(t.global.space["4"]).toBe(8);
    expect(t.components).toEqual({});
  });
  it("uses dark on-accent text when white fails on any fill", () => {
    expect(createTheme({ accent: "#f5d90a" }).palettes.light.onAccent).not.toBe("#ffffff");
  });
});

describe("component tokens of multi-word components", () => {
  it("are written with the component's kebab-case name, which is what its CSS reads", () => {
    const css = themeToCss(
      createTheme({ components: { sideNav: { width: "20rem" }, timeField: { rowHeight: "40px" } } as never }),
    );
    expect(css).toContain("--cy-side-nav-width:20rem");
    expect(css).toContain("--cy-time-field-row-height:40px");
    expect(css).not.toContain("--cy-sideNav");
  });
});

describe("palette overrides feed what is derived from them", () => {
  const surface = "#102030";
  const accent = "#2563eb";

  it("accentSoft is mixed with the palette's own surface", () => {
    const { light, dark } = createTheme({
      palettes: { light: { surface }, dark: { surface: "#0a0a0a" } },
    }).palettes;
    expect(light.accentSoft).toContain(surface);
    expect(dark.accentSoft).toContain("#0a0a0a");
  });

  it("an accent given for one palette re-derives that palette's hover, active, soft, text and on-accent", () => {
    const theme = createTheme({ palettes: { dark: { accent } } });
    const plain = createTheme({ accent }).palettes.dark;
    const { dark, light } = theme.palettes;
    for (const k of ["accentHover", "accentActive", "accentSoft", "onAccent", "accentText", "ring"] as const)
      expect(dark[k]).toBe(plain[k]);
    expect(light.accent).toBe(createTheme().palettes.light.accent);
  });

  it("a role given explicitly wins over the derived one", () => {
    const { light } = createTheme({ palettes: { light: { accent, accentHover: "#000000" } } }).palettes;
    expect(light.accentHover).toBe("#000000");
    expect(light.accentActive).toBe(createTheme({ accent }).palettes.light.accentActive);
  });

  it("the high-contrast palettes keep the product's palette", () => {
    const bg = "#e8f0ff";
    const theme = createTheme({ accent, palettes: { light: { bg, surface, ink: "#001133" } } });
    const hc = theme.palettes["light-contrast"];
    expect(hc.bg).toBe(bg);
    expect(hc.surface).toBe(surface);
    expect(hc.accent).toBe(accent);
    expect(hc.accentSoft).toContain(surface);
    expect(contrastRatio(hc.muted, bg)).toBeGreaterThanOrEqual(7);
    // The product's (contrast) palette reaches the stylesheet's prefers-contrast block.
    const css = themeToCss(theme);
    const block = css.slice(css.indexOf("@media (prefers-contrast:more)"));
    expect(block).toContain(bg);
  });

  it("a contrast palette patch re-derives its accent roles too", () => {
    const hc = createTheme({ palettes: { "dark-contrast": { accent } } }).palettes["dark-contrast"];
    expect(hc.accent).toBe(accent);
    expect(hc.accentHover).toBe(createTheme({ accent }).palettes.dark.accentHover);
  });
});
