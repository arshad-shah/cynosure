import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  createTheme,
  editorColors,
  monacoTheme,
  type PaletteName,
  textMateTheme,
  themeToCss,
} from "../../src/tokens";
import { buildCss } from "../../tools/build-css";

const PALETTES: PaletteName[] = ["light", "dark", "light-contrast", "dark-contrast"];
const HEX = /^#[0-9a-f]{6}$/;

describe("syntax colours", () => {
  it("read at 4.5:1 on every surface code sits on, and 7:1 in the contrast palettes", () => {
    for (const accent of [undefined, "#2563eb", "#facc15", "#16a34a"]) {
      const theme = createTheme(accent ? { accent } : {});
      for (const name of PALETTES) {
        const p = theme.palettes[name];
        const floor = name.endsWith("contrast") ? 7 : 4.5;
        for (const [key, value] of Object.entries(p).filter(([k]) => k.startsWith("syntax")))
          for (const on of [p.bg, p.surface, p.soft, p.surfaceRaised])
            expect(contrastRatio(value, on), `${name} ${key} on ${on}`).toBeGreaterThanOrEqual(floor);
      }
    }
  });
  it("keywords follow the accent; a palette can set any role", () => {
    const blue = createTheme({ accent: "#2563eb" }).palettes.light;
    expect(blue.syntaxKeyword).toBe(blue.accentText);
    const own = createTheme({ palettes: { dark: { syntaxString: "#00ff88" } } });
    expect(own.palettes.dark.syntaxString).toBe("#00ff88");
    expect(themeToCss(own)).toContain("--cy-color-syntax-string:light-dark(");
  });
});

describe("editor themes", () => {
  it("resolve every editor colour to hex, per palette", () => {
    for (const name of PALETTES)
      for (const [key, value] of Object.entries(editorColors(createTheme(), name)))
        expect(value, `${name} ${key}`).toMatch(HEX);
  });
  it("build a Monaco theme without importing Monaco", () => {
    const light = monacoTheme();
    expect(light.base).toBe("vs");
    expect(monacoTheme(createTheme(), "dark").base).toBe("vs-dark");
    expect(monacoTheme(createTheme(), "dark-contrast").base).toBe("hc-black");
    expect(monacoTheme(createTheme(), "light-contrast").base).toBe("hc-light");
    const keyword = light.rules.find((r) => r.token === "keyword");
    expect(`#${keyword?.foreground}`).toBe(createTheme().palettes.light.syntaxKeyword);
    expect(light.rules.find((r) => r.token === "comment")?.fontStyle).toBe("italic");
    expect(light.colors["editor.background"]).toMatch(HEX);
  });
  it("build a TextMate theme for Shiki and VS Code-style editors", () => {
    const dark = textMateTheme(createTheme(), "dark");
    expect(dark).toMatchObject({ name: "cynosure-dark", type: "dark" });
    const strings = dark.tokenColors.find((t) => t.scope.includes("string"));
    expect(strings?.settings.foreground).toBe(createTheme().palettes.dark.syntaxString);
    expect(textMateTheme().type).toBe("light");
  });
});

describe("syntax.css", () => {
  const source = readFileSync("src/syntax/syntax.css", "utf8");
  it("only reads tokens that exist, with no literal colours or lengths", () => {
    const tokens = themeToCss(createTheme());
    for (const [, name] of source.matchAll(/var\((--cy-[a-z0-9-]+)/g))
      expect(tokens, name).toContain(`${name}:`);
    const rules = source.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(rules).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(rules).not.toMatch(/\d+px/);
  });
  it("ships as its own stylesheet, outside styles.css", () => {
    const all = buildCss("src", "dist");
    expect(all).not.toContain("tok-keyword");
    expect(readFileSync("dist/styles/syntax.css", "utf8")).toContain("tok-keyword");
  });
});
