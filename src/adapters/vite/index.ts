/**
 * Optional Vite adapter. The package works without it; this adds build-time conveniences:
 *  - `virtual:cynosure/theme.css`: the product theme as CSS (import it once next to styles.css)
 *  - `virtual:cynosure/inline`: all Cynosure CSS plus the theme as a string (shadow roots, extension getStyle())
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createTheme, type ThemeInput, themeToCss } from "../../tokens/index.js";

export interface CynosureViteOptions {
  theme?: ThemeInput;
  /** Selector the theme is declared on (default: :root and :host). */
  selector?: string;
  /** Path to Cynosure's compiled stylesheet (defaults to the installed package's styles.css). */
  stylesheet?: string;
}

/** The subset of the Vite plugin contract this adapter uses (no dependency on Vite's types). */
export interface CynosureVitePlugin {
  name: "cynosure";
  enforce: "pre";
  resolveId(id: string): string | undefined;
  load(id: string): string | undefined;
}

const THEME = "virtual:cynosure/theme.css";
const INLINE = "virtual:cynosure/inline";

export function cynosure(options: CynosureViteOptions = {}): CynosureVitePlugin {
  // Built eagerly so an invalid theme fails the build immediately.
  const themeCss = themeToCss(createTheme(options.theme), options.selector);
  const stylesheet = () =>
    readFileSync(options.stylesheet ?? fileURLToPath(new URL("../../styles.css", import.meta.url)), "utf8");
  return {
    name: "cynosure",
    enforce: "pre",
    resolveId(id) {
      return id === THEME || id === INLINE ? `\0${id}` : undefined;
    },
    load(id) {
      if (id === `\0${THEME}`) return themeCss;
      if (id === `\0${INLINE}`) return `export default ${JSON.stringify(`${stylesheet()}\n${themeCss}`)};`;
      return undefined;
    },
  };
}
