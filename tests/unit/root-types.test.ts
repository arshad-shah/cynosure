import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, test } from "vitest";

const root = fileURLToPath(new URL("../../src/", import.meta.url));
const program = ts.createProgram([`${root}index.ts`], {
  strict: true,
  skipLibCheck: true,
  noEmit: true,
  jsx: ts.JsxEmit.ReactJSX,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
});
const checker = program.getTypeChecker();
const source = program.getSourceFile(`${root}index.ts`);
const module = source && checker.getSymbolAtLocation(source);
const names = new Set((module ? checker.getExportsOfModule(module) : []).map((s) => s.getName()));

test("the root entry exports the types its components' props are written in", () => {
  for (const name of [
    "IconData",
    "IconNode",
    "BrandInfo",
    "Space",
    "Breakpoint",
    "LayoutAttributes",
    "GridResponsive",
  ])
    expect(names, name).toContain(name);
});

test("layout primitives accept an id, a role and ARIA attributes", () => {
  const file = ts.createSourceFile(
    `${root}__layout-check.tsx`,
    `import { Container, Grid, GridItem, Inline, Stack } from "./index.js";
     export const a = <Stack id="s" role="group" aria-label="Group" aria-describedby="d" />;
     export const b = <Inline id="i" role="toolbar" aria-labelledby="l" hideBelow="md" />;
     export const c = <Container id="c" aria-label="Main column" hideAbove="lg" />;
     export const d = <Grid id="g" role="list" aria-label="Cards" columns="2fr 1fr" />;
     export const e = <GridItem id="gi" role="listitem" sticky stickyOffset="4rem" span={{ base: "full", md: 2 }} order={{ md: 1 }} />;`,
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TSX,
  );
  const host = ts.createCompilerHost(program.getCompilerOptions());
  const read = host.getSourceFile.bind(host);
  host.getSourceFile = (name, ...rest) => (name === file.fileName ? file : read(name, ...rest));
  const check = ts.createProgram([file.fileName], program.getCompilerOptions(), host);
  const errors = ts
    .getPreEmitDiagnostics(check, file)
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
  expect(errors).toEqual([]);
});
