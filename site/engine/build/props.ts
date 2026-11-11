/**
 * Props tables generated from the published package's own type declarations, at build time, so every
 * table matches what users install. Only props Cynosure declares are listed: attributes inherited from React's DOM
 * types (an input's hundreds of HTML attributes) are left to the platform's documentation.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import ts from "typescript";
import type { PropRow } from "../types.ts";

const require = createRequire(import.meta.url);

/** The folder an installed package lives in. */
export const packageDir = (name: string) => dirname(require.resolve(`${name}/package.json`));

interface Loaded {
  pkgDir: string;
  checker: ts.TypeChecker;
  exports: Map<string, ts.Symbol>;
}
const cache = new Map<string, Loaded>();
function load(pkg: string): Loaded {
  const cached = cache.get(pkg);
  if (cached) return cached;
  const pkgDir = packageDir(pkg);
  const manifest = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  const types = manifest.exports?.["."]?.types ?? manifest.types ?? "dist/index.d.ts";
  const entry = join(pkgDir, types);
  const program = ts.createProgram([entry], {
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  const module = source && checker.getSymbolAtLocation(source);
  const exports = new Map((module ? checker.getExportsOfModule(module) : []).map((s) => [s.getName(), s]));
  const loaded = { pkgDir, checker, exports };
  cache.set(pkg, loaded);
  return loaded;
}

/**
 * The default stated in a doc comment ("Default: 768.", "Default 1", "Defaults to `button` so …"): the value only. A
 * phrase that is not a short value is left out rather than shown as a default.
 */
function defaultFrom(text: string): string {
  const found =
    /\bDefaults?(?::| to| is)? ([^.;,]+?)(?:[.;,]| so | when | unless |$)/.exec(text)?.[1]?.trim() ?? "";
  return found.split(/\s+/).length <= 4 ? found : "";
}

/** The props of `<name>Props` in `pkg`, or null when the package exports no such type. */
export function propsOf(pkg: string, name: string): PropRow[] | null {
  const { checker, exports, pkgDir } = load(pkg);
  // Declared by the package itself. A package used from its own repository (`workspace:*`) has its dependencies'
  // types in a `node_modules` inside its folder, and those (React's HTML attributes) are not its own.
  const ownDeclaration = (symbol: ts.Symbol) =>
    (symbol.getDeclarations() ?? []).some((d) => {
      const file = d.getSourceFile().fileName;
      return file.startsWith(pkgDir) && !file.slice(pkgDir.length).includes("/node_modules/");
    });
  const symbol = exports.get(`${name}Props`);
  if (!symbol) return null;
  const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const type = checker.getDeclaredTypeOfSymbol(target);
  const rows: PropRow[] = [];
  for (const prop of checker.getPropertiesOfType(type)) {
    if (!ownDeclaration(prop)) continue;
    const declaration = prop.getDeclarations()?.[0];
    const propType = declaration
      ? checker.getTypeOfSymbolAtLocation(prop, declaration)
      : checker.getAnyType();
    const description = ts
      .displayPartsToString(prop.getDocumentationComment(checker))
      .replace(/\s+/g, " ")
      .trim();
    const tagDefault = prop.getJsDocTags(checker).find((t) => t.name === "default");
    rows.push({
      name: prop.getName(),
      type: checker
        .typeToString(
          propType,
          declaration,
          ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
        )
        .replace(/ \| undefined$/, ""),
      required: !(prop.flags & ts.SymbolFlags.Optional),
      default: tagDefault ? ts.displayPartsToString(tagDefault.text) : defaultFrom(description),
      description,
    });
  }
  // Required props first, then in declaration order.
  return rows.sort((a, b) => Number(b.required) - Number(a.required));
}

/** The names of every component-like value `pkg` exports (capitalised), for telling its components from helpers. */
export function exportedNames(pkg: string): string[] {
  return [...load(pkg).exports.keys()].filter((name) => /^[A-Z][a-z]/.test(name)).sort();
}
