import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createTheme,
  createThemeRegistry,
  defineTheme,
  resolveColors,
  swiftChartTheme,
  themeInitScript,
  themeToCss,
} from "../../src/entries/tokens";

describe("tokens without React", () => {
  it("builds a theme and its CSS, and the colour-mode script", () => {
    const css = themeToCss(createTheme({ accent: "#2f66b0" }));
    expect(css).toContain("--cy-color-accent");
    expect(themeInitScript()).toContain("cy-color-mode");
  });
  it("has the named themes and the chart helpers", () => {
    const midnight = defineTheme({ id: "midnight", name: "Midnight", mode: "dark" });
    expect(createThemeRegistry([midnight.definition]).get("midnight")?.mode).toBe("dark");
    expect(swiftChartTheme(midnight.theme, "dark").bg).toBe(resolveColors(midnight.theme, "dark").bg);
  });
  it("imports nothing from React", () => {
    // The entry and everything it pulls in are plain modules.
    const files = [
      "src/entries/tokens.ts",
      "src/theme/theme-init-script.ts",
      "src/tokens/index.ts",
      "src/tokens/to-css.ts",
      "src/tokens/create-theme.ts",
      "src/tokens/color.ts",
      "src/tokens/defaults.ts",
      "src/tokens/named-themes.ts",
      "src/tokens/chart-themes.ts",
      "src/tokens/editor-themes.ts",
    ];
    for (const f of files) expect(readFileSync(f, "utf8")).not.toMatch(/from "react/);
  });
});
