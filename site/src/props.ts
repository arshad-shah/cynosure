/**
 * Props tables generated from the published package's own type declarations (dist/*.d.ts), at build time, so every
 * table matches what users install. Only props Cynosure declares are listed: attributes inherited from React's DOM
 * types (an input's hundreds of HTML attributes) are left to the platform's documentation.
 */
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import ts from "typescript";

export interface PropRow {
  name: string;
  type: string;
  required: boolean;
  default: string;
  description: string;
}

const require = createRequire(import.meta.url);
const pkgDir = dirname(require.resolve("@arshad-shah/cynosure/package.json"));
const entry = join(pkgDir, "dist", "index.d.ts");

let cached: { checker: ts.TypeChecker; exports: Map<string, ts.Symbol> } | null = null;
function load() {
  if (cached) return cached;
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
  cached = { checker, exports };
  return cached;
}

const ownDeclaration = (symbol: ts.Symbol) =>
  (symbol.getDeclarations() ?? []).some((d) => d.getSourceFile().fileName.startsWith(pkgDir));

/**
 * The default stated in a doc comment ("Default: 768.", "Default 1", "Defaults to `button` so …"): the value only. A
 * phrase that is not a short value is left out rather than shown as a default.
 */
function defaultFrom(text: string): string {
  const found =
    /\bDefaults?(?::| to| is)? ([^.;,]+?)(?:[.;,]| so | when | unless |$)/.exec(text)?.[1]?.trim() ?? "";
  return found.split(/\s+/).length <= 4 ? found : "";
}

/** The props of `<name>Props`, or null when the package exports no such type. */
export function propsOf(name: string): PropRow[] | null {
  const { checker, exports } = load();
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
