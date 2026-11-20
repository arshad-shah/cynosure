import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cssSources } from "../../tools/build-css";
import { styleManifest } from "../../tools/style-manifest";

const manifest = styleManifest("src", cssSources("src"));
const cssText = new Map(
  cssSources("src").map((f) => [f.split(/[\\/]/).pop() as string, readFileSync(f, "utf8")]),
);
const all = [...cssText.keys()];
const defines = (files: string[], cls: string) =>
  files.some((f) => new RegExp(`\\.${cls}(?![a-z0-9-])`).test(cssText.get(f) ?? ""));

describe("stylesheet manifest", () => {
  it("lists the stylesheets that live somewhere else than you would look", () => {
    expect(manifest.Inline).toContain("stack.css");
    expect(manifest.Sheet).toContain("dialog.css");
    expect(manifest.Accordion).toContain("disclosure.css");
    expect(manifest.IconButton).toContain("tooltip.css");
    expect(manifest.Button).toContain("loading-dots.css");
    for (const name of Object.keys(manifest)) expect(manifest[name]?.[0], name).toBe("base.css");
    // Shared rules live in base.css, which every component lists.
    expect(defines(["base.css"], "cy-visually-hidden")).toBe(true);
  });

  it("covers every class each component puts in the page", () => {
    const missing: string[] = [];
    for (const group of ["components", "foundations"])
      for (const dir of readdirSync(join("src", group))) {
        const folder = join("src", group, dir);
        let files: string[];
        try {
          files = readdirSync(folder).filter((f) => /\.tsx?$/.test(f) && !f.includes(".stories."));
        } catch {
          continue; // a file, not a component folder
        }
        // The entries this folder exports: every one of them must bring the CSS for the classes it renders.
        const names = Object.keys(manifest).filter((n) =>
          files.some((f) =>
            new RegExp(`export (?:const|function|class) ${n}\\b`).test(readFileSync(join(folder, f), "utf8")),
          ),
        );
        for (const file of files) {
          const text = readFileSync(join(folder, file), "utf8");
          // Classes no stylesheet styles are hooks for products and tests; only styled ones must be listed.
          for (const [cls] of text.matchAll(/(?<![\w$-])cy-[a-z0-9]+(?:-[a-z0-9]+)*(?![\w$-])/g))
            for (const name of names)
              if (defines(all, cls) && !defines(manifest[name] as string[], cls))
                missing.push(`${name}: .${cls}`);
        }
      }
    expect([...new Set(missing)]).toEqual([]);
  });
});

describe("stylesheet manifest of components that import each other", () => {
  it("gives each one every stylesheet it reaches, whichever is worked out first", () => {
    const root = mkdtempSync(join(tmpdir(), "cy-manifest-"));
    try {
      const file = (path: string, text: string) => {
        mkdirSync(join(root, path, ".."), { recursive: true });
        writeFileSync(join(root, path), text);
      };
      file(
        "index.ts",
        'export { A } from "./components/A/A.js";\nexport { B } from "./components/B/B.js";\n',
      );
      // A imports B and D; B imports A back, so B reaches D through A.
      file(
        "components/A/A.tsx",
        'import { B } from "../B/B.js";\nimport { D } from "../D/D.js";\nexport const A = 1;\n',
      );
      file("components/B/B.tsx", 'import { A } from "../A/A.js";\nexport const B = 1;\n');
      file("components/D/D.tsx", "export const D = 1;\n");
      for (const n of ["a", "b", "d"]) file(`components/${n.toUpperCase()}/${n}.css`, "");
      const m = styleManifest(root);
      expect(new Set(m.A)).toEqual(new Set(["base.css", "a.css", "b.css", "d.css"]));
      expect(new Set(m.B)).toEqual(new Set(["base.css", "a.css", "b.css", "d.css"]));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
