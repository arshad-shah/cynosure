/**
 * Which stylesheets each component needs, worked out from the source: a component needs the CSS in its own folder
 * and in the folder of everything it imports, all the way down (Sheet → DialogBase, IconButton → Tooltip, Inline →
 * Stack's stack.css), plus base.css. A file that uses another component's classes without importing it says so with a
 * `// cy-styles: <file>.css` comment (tests/unit/style-manifest.test.ts fails until it does). Written to dist/styles/manifest.json by the CSS build, so the list is never kept
 * by hand. Type-only imports bring no CSS.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const STATEMENT = /(?:^|\n)\s*(import|export)\s+(type\s+)?([^;]*?)\s*from\s+["'](\.[^"']+)["']/g;
const SIDE_EFFECT = /(?:^|\n)\s*import\s+["'](\.[^"']+)["']/g;
/** `// cy-styles: combobox.css` in a source file: CSS it uses without importing the component that owns it. */
const BORROWED = /\/\/\s*cy-styles:\s*([a-z0-9.\- ,]+)/g;
const LOCAL = /(?:^|\n)\s*export\s+(?:const|function|class)\s+([A-Za-z0-9_]+)/g;

/** The source file an import specifier names (`./x.js` → x.ts or x.tsx, a folder → its index). */
function resolveFile(from: string, spec: string): string | undefined {
  const base = resolve(dirname(from), spec.replace(/\.js$/, ""));
  for (const candidate of [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")])
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  return undefined;
}

/** Files a source file imports for their values (type-only statements and specifiers left out). */
function valueImports(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const out: string[] = [];
  for (const m of text.matchAll(STATEMENT)) {
    const [, , typeOnly, clause = "", spec = ""] = m;
    if (typeOnly) continue;
    // `{ type A, type B }` brings only types; `*` or any name without `type` brings a value.
    const names = clause
      .replace(/^\{|\}$/g, "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    if (clause.startsWith("{") && names.every((n) => n.startsWith("type "))) continue;
    const target = resolveFile(file, spec);
    if (target) out.push(target);
  }
  for (const m of text.matchAll(SIDE_EFFECT)) {
    const target = resolveFile(file, m[1] ?? "");
    if (target) out.push(target);
  }
  return out;
}

/** The value names a module exports, with the file each comes from (following `export … from` and `export *`). */
function exportsOf(file: string, seen = new Set<string>()): Map<string, string> {
  const names = new Map<string, string>();
  if (seen.has(file)) return names;
  seen.add(file);
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(LOCAL)) names.set(m[1] as string, file);
  for (const m of text.matchAll(STATEMENT)) {
    const [, kind, typeOnly, clause = "", spec = ""] = m;
    if (kind !== "export" || typeOnly) continue;
    const target = resolveFile(file, spec);
    if (!target) continue;
    if (clause === "*") {
      for (const [name, from] of exportsOf(target, seen)) names.set(name, from);
      continue;
    }
    for (const raw of clause.replace(/^\{|\}$/g, "").split(",")) {
      const name = raw.trim();
      if (!name || name.startsWith("type ")) continue;
      names.set(name.split(/\s+as\s+/).pop() as string, target);
    }
  }
  return names;
}

/** The stylesheets in the folder a source file belongs to (a component or foundation folder, or src/styles). */
function ownCss(file: string, root: string): string[] {
  const dir = dirname(file);
  const parts = relative(root, dir).split(/[\\/]/);
  const styled = (parts[0] === "components" || parts[0] === "foundations") && parts.length === 2;
  if (!styled && relative(root, dir) !== "theme") return [];
  return readdirSync(dir).filter((f) => f.endsWith(".css"));
}

/**
 * For every component the root entry exports (PascalCase names), the stylesheets it needs, as file names under
 * `@arshad-shah/cynosure/styles/`, in the order `styles.css` has them (base first).
 */
export function styleManifest(root = "src", order: string[] = []): Record<string, string[]> {
  const rank = (css: string) => {
    const i = order.findIndex((f) => basename(f) === css);
    return i < 0 ? order.length : i;
  };
  const closure = new Map<string, Set<string>>();
  const cssOf = (file: string): Set<string> => {
    const known = closure.get(file);
    if (known) return known;
    const found = new Set<string>();
    closure.set(file, found); // cycles end here
    for (const css of ownCss(file, root)) found.add(css);
    for (const m of readFileSync(file, "utf8").matchAll(BORROWED))
      for (const css of (m[1] ?? "").split(/[ ,]+/).filter(Boolean)) found.add(css);
    for (const dep of valueImports(file)) for (const css of cssOf(dep)) found.add(css);
    return found;
  };
  const manifest: Record<string, string[]> = {};
  const entries = [...exportsOf(join(root, "index.ts"))].filter(([name]) => /^[A-Z][A-Za-z0-9]*$/.test(name));
  for (const [name, file] of entries.sort(([a], [b]) => a.localeCompare(b)))
    manifest[name] = [
      "base.css",
      ...[...cssOf(file)].filter((c) => c !== "base.css").sort((a, b) => rank(a) - rank(b)),
    ];
  return manifest;
}
