/**
 * Optional Vite adapter. The package works without it; this adds build-time conveniences:
 *  - `virtual:cynosure/theme.css`: the product theme as CSS (import it once next to styles.css)
 *  - `virtual:cynosure/inline`: all Cynosure CSS plus the theme as a string (shadow roots, extension getStyle())
 *  - `styles: "imports"`: each module that imports components from the package also imports the stylesheets those
 *    components need (from `styles/manifest.json`), instead of all of `styles.css`
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
  /**
   * `"imports"`: add only the stylesheets the components you import need, worked out from each module's
   * `import { … } from "@arshad-shah/cynosure"` and the package's `styles/manifest.json`, plus the default tokens when
   * no `theme` is given (with a theme, import `virtual:cynosure/theme.css`). Leave it out to import `styles.css` yourself.
   */
  styles?: "imports" | undefined;
  /** Path to `styles/manifest.json` (defaults to the installed package's). */
  manifest?: string;
}

/** The subset of the Vite plugin contract this adapter uses (no dependency on Vite's types). */
export interface CynosureVitePlugin {
  name: "cynosure";
  enforce: "pre";
  resolveId(id: string): string | undefined;
  load(id: string): string | undefined;
  transform(code: string, id: string): string | undefined;
}

const IMPORT = /import\s*\{([^}]*)\}\s*from\s*["']@arshad-shah\/cynosure["']/g;

/** The stylesheet imports a module needs for the Cynosure components it imports (none if it imports none). */
export function stylesForImports(
  code: string,
  manifest: Record<string, string[]>,
  tokens: boolean,
): string[] {
  const files = new Set<string>();
  for (const m of code.matchAll(IMPORT))
    for (const raw of (m[1] ?? "").split(",")) {
      const name = raw.trim().split(/\s+as\s+/)[0] as string;
      if (!name || name.startsWith("type ")) continue;
      for (const css of manifest[name] ?? []) files.add(css);
    }
  if (files.size === 0) return [];
  const list = [...(tokens ? ["tokens.css"] : []), ...files];
  return list.map((css) => `@arshad-shah/cynosure/styles/${css}`);
}

const THEME = "virtual:cynosure/theme.css";
const INLINE = "virtual:cynosure/inline";

export function cynosure(options: CynosureViteOptions = {}): CynosureVitePlugin {
  // Built eagerly so an invalid theme fails the build immediately.
  const themeCss = themeToCss(createTheme(options.theme), options.selector);
  const stylesheet = () =>
    readFileSync(options.stylesheet ?? fileURLToPath(new URL("../../styles.css", import.meta.url)), "utf8");
  let read: Record<string, string[]> | undefined;
  const manifest = () =>
    (read ??= JSON.parse(
      readFileSync(
        options.manifest ?? fileURLToPath(new URL("../../styles/manifest.json", import.meta.url)),
        "utf8",
      ),
    ) as Record<string, string[]>);
  return {
    name: "cynosure",
    enforce: "pre",
    resolveId(id) {
      return id === THEME || id === INLINE ? `\0${id}` : undefined;
    },
    transform(code, id) {
      if (options.styles !== "imports" || id.startsWith("\0") || id.includes("/node_modules/"))
        return undefined;
      const imports = stylesForImports(code, manifest(), !options.theme);
      // Appended: imports are hoisted, and Vite loads each stylesheet once however many modules ask for it.
      return imports.length
        ? `${code}\n${imports.map((i) => `import ${JSON.stringify(i)};`).join("\n")}\n`
        : undefined;
    },
    load(id) {
      if (id === `\0${THEME}`) return themeCss;
      if (id === `\0${INLINE}`) return `export default ${JSON.stringify(`${stylesheet()}\n${themeCss}`)};`;
      return undefined;
    },
  };
}
