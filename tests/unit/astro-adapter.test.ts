import { describe, expect, it } from "vitest";
import { cynosure, htmlAttributes } from "../../src/adapters/astro";
import { CynosureThemeError } from "../../src/tokens";

/** Runs the integration's setup hook and records what it asked Astro to do. */
function setup(options?: Parameters<typeof cynosure>[0]) {
  const scripts: [string, string][] = [];
  const plugins: unknown[] = [];
  cynosure(options).hooks["astro:config:setup"]({
    updateConfig: (config) => plugins.push(...config.vite.plugins),
    injectScript: (stage, content) => scripts.push([stage, content]),
  });
  return { scripts, plugins };
}

type Plugin = { resolveId(id: string): string | undefined; load(id: string): string | undefined };

describe("cynosure() Astro integration", () => {
  it("adds the product theme and the stylesheet to every page, rendered on the server", () => {
    const { scripts, plugins } = setup({ theme: { accent: "#0f766e" } });
    const plugin = plugins[0] as Plugin;
    const css = plugin.load(plugin.resolveId("virtual:cynosure/theme.css") as string) as string;
    // The theme is CSS on :root, so <html> is themed by the stylesheet itself: no script, no flash.
    expect(css.startsWith(":where(:root,:host){")).toBe(true);
    expect(css).toContain("--cy-color-accent:#0f766e");
    const ssr = scripts.filter(([stage]) => stage === "page-ssr").map(([, c]) => c);
    expect(ssr).toEqual(['import "@arshad-shah/cynosure/styles.css";\nimport "virtual:cynosure/theme.css";']);
  });

  it("applies the saved colour mode before the first paint, under the key given", () => {
    const inline = (o?: Parameters<typeof cynosure>[0]) =>
      setup(o).scripts.filter(([stage]) => stage === "head-inline");
    expect(inline()[0]?.[1]).toContain('localStorage.getItem("cy-color-mode")');
    expect(inline({ initScript: { key: "nimaz-mode" } })[0]?.[1]).toContain('getItem("nimaz-mode")');
    expect(inline({ initScript: false })).toEqual([]);
  });

  it("can leave the stylesheet to the product", () => {
    const ssr = setup({ styles: false }).scripts.find(([stage]) => stage === "page-ssr");
    expect(ssr?.[1]).toBe('import "virtual:cynosure/theme.css";');
  });

  it("fails the build for an invalid theme", () => {
    expect(() => cynosure({ theme: { accent: "not a colour" } })).toThrow(CynosureThemeError);
  });
});

describe("htmlAttributes()", () => {
  it("gives <html> the mode and contrast attributes the stylesheet switches on", () => {
    expect(htmlAttributes()).toEqual({ "data-cy-mode": "system" });
    expect(htmlAttributes({ mode: "dark", contrast: "more" })).toEqual({
      "data-cy-mode": "dark",
      "data-cy-contrast": "more",
    });
  });
});
