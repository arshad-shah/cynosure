/**
 * Optional Astro adapter. Astro renders pages on the server, where React's CynosureTheme (`target="document"`) never
 * runs, so `<html>` would get no theme until a script did. This themes the page in the HTML itself:
 *  - the product theme as CSS on `:root` (the Vite adapter's `virtual:cynosure/theme.css`), and Cynosure's stylesheet,
 *    added to every page;
 *  - `htmlAttributes()`, the colour mode and contrast attributes to spread on `<html>` in your layout;
 *  - the saved-mode script inline in `<head>`, so a visitor's own choice applies before the first paint.
 */
import { type ThemeInitScriptOptions, themeInitScript } from "../../theme/theme-init-script.js";
import { type CynosureViteOptions, type CynosureVitePlugin, cynosure as vitePlugin } from "../vite/index.js";

export interface CynosureAstroOptions extends Omit<CynosureViteOptions, "styles"> {
  /**
   * `true` (default): add all of `styles.css` to every page. `"imports"`: only the stylesheets the components each
   * page and island imports need (the Vite adapter's `styles: "imports"`). `false`: you import styles yourself.
   */
  styles?: boolean | "imports";
  /**
   * Apply the visitor's saved colour mode before the first paint (`themeInitScript`, inline in `<head>`): `false` to
   * leave it out (pages with a content security policy that forbids inline scripts), or its options (`key` must match
   * ThemeToggle's `storageKey`). Default true.
   */
  initScript?: boolean | ThemeInitScriptOptions;
}

/** The parts of Astro's `astro:config:setup` hook this adapter uses (no dependency on Astro's types). */
export interface CynosureAstroSetup {
  updateConfig(config: { vite: { plugins: CynosureVitePlugin[] } }): unknown;
  injectScript(stage: "head-inline" | "page-ssr", content: string): void;
}

/** The subset of the Astro integration contract this adapter uses. */
export interface CynosureAstroIntegration {
  name: "@arshad-shah/cynosure";
  hooks: { "astro:config:setup": (setup: CynosureAstroSetup) => void };
}

/** The Astro integration: `integrations: [cynosure({ theme })]` in `astro.config.mjs`. */
export function cynosure(options: CynosureAstroOptions = {}): CynosureAstroIntegration {
  const { styles = true, initScript = true, ...vite } = options;
  // Built eagerly (by the Vite adapter), so an invalid theme fails the build at once.
  const plugin = vitePlugin(styles === "imports" ? { ...vite, styles: "imports" } : vite);
  return {
    name: "@arshad-shah/cynosure",
    hooks: {
      "astro:config:setup": ({ updateConfig, injectScript }) => {
        updateConfig({ vite: { plugins: [plugin] } });
        const imports = [
          ...(styles === true ? ['import "@arshad-shah/cynosure/styles.css";'] : []),
          'import "virtual:cynosure/theme.css";',
        ];
        injectScript("page-ssr", imports.join("\n"));
        if (initScript) injectScript("head-inline", themeInitScript(initScript === true ? {} : initScript));
      },
    },
  };
}

export interface HtmlAttributesOptions {
  /** The colour mode the page starts in, before any saved choice is read. Default "system" (follows the device). */
  mode?: "light" | "dark" | "system";
  /** `more` uses the higher-contrast palettes; `system` (the default) follows the device setting. */
  contrast?: "normal" | "more" | "system";
}

/**
 * Attributes for `<html>`, rendered on the server: `<html lang="en" {...htmlAttributes({ mode: "system" })}>`. They
 * switch Cynosure's colour mode and contrast for the whole page with no script.
 */
export function htmlAttributes({
  mode = "system",
  contrast,
}: HtmlAttributesOptions = {}): Record<string, string> {
  return { "data-cy-mode": mode, ...(contrast ? { "data-cy-contrast": contrast } : {}) };
}
