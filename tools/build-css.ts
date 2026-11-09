/**
 * Builds Cynosure CSS with Lightning CSS (no hand-written post-processing):
 *  - dist/styles/<name>.css  one file per CSS source (base, theme, each foundation/component)
 *  - dist/styles.css         all of them, in a fixed order
 *  - src/styles/generated-css.ts  the same CSS as a string for `styles.inline` (git-ignored)
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { transform } from "lightningcss";
import { createTheme, themeToCss } from "../src/tokens";

/** Latest evergreen engines (spec: no down-levelling for old browsers). Lightning CSS encodes major << 16. */
const TARGETS = { chrome: 130 << 16, edge: 130 << 16, firefox: 133 << 16, safari: 18 << 16 };

/** Ordered CSS sources: base first, then theme, foundations, components (alphabetical inside a group). */
export function cssSources(root = "src"): string[] {
  const group = (dir: string) =>
    existsSync(join(root, dir))
      ? readdirSync(join(root, dir), { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
          .sort()
          .flatMap((name) =>
            readdirSync(join(root, dir, name))
              .filter((f) => f.endsWith(".css"))
              .map((f) => join(root, dir, name, f)),
          )
      : [];
  const base = ["styles/base.css", "theme/theme.css"].map((f) => join(root, f)).filter(existsSync);
  return [...base, ...group("foundations"), ...group("components")];
}

export function buildCss(root = "src", out = "dist"): string {
  mkdirSync(join(out, "styles"), { recursive: true });
  const parts = cssSources(root).map((file) => {
    const { code } = transform({ filename: file, code: readFileSync(file), minify: true, targets: TARGETS });
    const css = code.toString();
    writeFileSync(join(out, "styles", basename(file)), css);
    return css;
  });
  // Optional fonts (CSS + woff2 + licence) are copied verbatim; they are opt-in imports, not part of styles.css.
  const fonts = join(root, "fonts");
  if (existsSync(fonts)) {
    mkdirSync(join(out, "fonts"), { recursive: true });
    for (const file of readdirSync(fonts)) copyFileSync(join(fonts, file), join(out, "fonts", file));
  }
  const tokens = themeToCss(createTheme());
  writeFileSync(join(out, "styles", "tokens.css"), tokens);
  const all = tokens + parts.join("");
  writeFileSync(join(out, "styles.css"), all);
  writeFileSync(join(root, "styles", "generated-css.ts"), `export default ${JSON.stringify(all)};\n`);
  return all;
}

if (import.meta.url === `file://${process.argv[1]}`) buildCss();
