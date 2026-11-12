import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { clientBanner } from "../../tools/banner";

const SRC = join(import.meta.dirname, "../../src");

/** The source file of a module id ("foundations/qr" is src/foundations/qr.ts). */
function sourceOf(id: string): string {
  for (const ext of [".ts", ".tsx", "/index.ts"])
    if (existsSync(join(SRC, id + ext))) return join(SRC, id + ext);
  throw new Error(`no source for ${id}`);
}

/** What the build sees a module import at runtime: its imports after TypeScript erases the type-only ones. */
function runtimeImports(id: string): string[] {
  const file = sourceOf(id);
  const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2023,
      jsx: ts.JsxEmit.ReactJSX,
      verbatimModuleSyntax: true,
    },
  });
  return [
    ...outputText.matchAll(/(?:^|[\s;])(?:import|export)\s*(?:[^"';]*?\sfrom\s*)?["']([^"']+)["']/g),
  ].map((m) => m[1] as string);
}

/** A module id and every module it reaches through relative imports. */
function reachable(entry: string): string[] {
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const dir = dirname(sourceOf(id));
    for (const spec of runtimeImports(id).filter((s) => s.startsWith(".")))
      visit(relative(SRC, join(dir, spec)).replace(/\.js$/, ""));
  };
  visit(entry);
  return [...seen];
}

const banner = (id: string) => clientBanner({ name: id, imports: runtimeImports(id) });

describe('"use client" banner', () => {
  it("marks modules that run React as client modules", () => {
    for (const id of [
      "components/Button/Button",
      "foundations/ButtonBase/ButtonBase",
      "foundations/hotkey",
      "foundations/zoom-gestures",
      "overlay/floating",
      "theme/CynosureTheme",
      "theme/use-color-mode",
    ])
      expect(banner(id), id).toBe('"use client";');
  });

  it("leaves pure modules usable from server components", () => {
    for (const id of ["foundations/qr", "foundations/zoom", "foundations/math", "theme/theme-init-script"])
      expect(banner(id), id).toBe("");
  });

  it("never marks the tokens entry or anything it imports", () => {
    const ids = reachable("entries/tokens");
    expect(ids).toContain("theme/theme-init-script");
    expect(ids).toContain("tokens/to-css");
    for (const id of ids) expect(banner(id), id).toBe("");
  });

  it("leaves icons, adapters, inline styles and the index barrel alone", () => {
    for (const id of ["icons/search", "adapters/vite/index", "styles/inline", "index"])
      expect(banner(id), id).toBe("");
  });
});
