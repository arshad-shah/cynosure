import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, test } from "vitest";

/**
 * The documentation site builds every props table from the comment above each prop, so a prop without one has an
 * empty row. Every prop Cynosure declares on an exported `…Props` type must say what it does.
 */
test("every prop of every exported Props type is described", () => {
  const root = fileURLToPath(new URL("../../src/", import.meta.url));
  const entry = `${root}index.ts`;
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
  const exported = module ? checker.getExportsOfModule(module) : [];
  const types = exported.filter((symbol) => symbol.getName().endsWith("Props"));
  expect(types.length).toBeGreaterThan(50);

  const missing: string[] = [];
  for (const symbol of types) {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    for (const prop of checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(target))) {
      // Attributes inherited from React's own types are the platform's to document.
      const own = (prop.getDeclarations() ?? []).some((d) => d.getSourceFile().fileName.startsWith(root));
      if (own && !ts.displayPartsToString(prop.getDocumentationComment(checker)).trim())
        missing.push(`${symbol.getName()}.${prop.getName()}`);
    }
  }
  expect(missing).toEqual([]);
});
