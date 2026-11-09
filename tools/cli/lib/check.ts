/** `cy check`: every Cynosure convention as a rule. Pure: returns violations, never exits. */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

export interface Violation {
  rule: string;
  file: string;
  line: number;
  message: string;
}

const NATIVE = new Set([
  "button",
  "a",
  "input",
  "textarea",
  "select",
  "dialog",
  "details",
  "summary",
  "option",
]);
// Emoji and common text glyphs used as fake icons.
const GLYPHS = /[\p{Extended_Pictographic}✓✔✕✖×▸▾▴◂›‹»«←→↑↓⌄⌃☰⋯]/u;

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const isStory = (f: string) => f.endsWith(".stories.tsx");
const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;

function tsxRules(root: string, file: string, out: Violation[]) {
  const rel = relative(root, file);
  const text = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const inFoundations = rel.startsWith("src/foundations/");
  const at = (node: ts.Node) => source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      if (!inFoundations && NATIVE.has(tag))
        out.push({
          rule: "native-elements",
          file: rel,
          line: at(node),
          message: `<${tag}> outside src/foundations; use the Cynosure component`,
        });
    }
    if (ts.isJsxAttribute(node) && node.name.getText(source) === "title")
      out.push({
        rule: "title-attr",
        file: rel,
        line: at(node),
        message: "title= creates a native tooltip; use Tooltip or a label",
      });
    if (ts.isJsxText(node) && GLYPHS.test(node.getText(source)))
      out.push({
        rule: "glyphs",
        file: rel,
        line: at(node),
        message: "text or emoji glyph used as an icon; use <Icon>",
      });
    ts.forEachChild(node, visit);
  };
  visit(source);
}

/** Removes var(...) groups (balanced) so fallback literals inside them are allowed. */
function stripVars(css: string): string {
  let out = "";
  for (let i = 0; i < css.length; i++) {
    if (css.startsWith("var(", i)) {
      let depth = 0;
      for (; i < css.length; i++) {
        if (css[i] === "(") depth++;
        else if (css[i] === ")" && --depth === 0) break;
      }
      out += "var()";
    } else out += css[i];
  }
  return out;
}

function literalRules(root: string, file: string, out: Violation[]) {
  const text = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const stripped = stripVars(line);
    for (const m of stripped.matchAll(/#[0-9a-f]{3,8}\b|\b\d+(?:\.\d+)?px\b/gi))
      out.push({
        rule: "literals",
        file: relative(root, file),
        line: i + 1,
        message: `literal ${m[0]}: use a --cy-* token`,
      });
  });
}

function structureRules(root: string, out: Violation[]) {
  for (const group of ["src/components", "src/foundations"]) {
    const dir = join(root, group);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory())) {
      const folder = join(dir, name);
      const files = readdirSync(folder);
      const story = files.find(isStory);
      const rel = relative(root, folder);
      if (!story || !readFileSync(join(folder, story), "utf8").includes("play:"))
        out.push({
          rule: "structure",
          file: rel,
          line: 1,
          message: "needs a *.stories.tsx with at least one play test",
        });
      const readme = join(folder, "README.md");
      if (!existsSync(readme) || !readFileSync(readme, "utf8").includes("## Used by"))
        out.push({
          rule: "structure",
          file: rel,
          line: 1,
          message: "needs a README.md with a '## Used by' section",
        });
    }
  }
}

export function check(root: string): Violation[] {
  const out: Violation[] = [];
  const files = walk(join(root, "src"));
  for (const file of files) {
    const rel = relative(root, file);
    if (
      file.endsWith(".tsx") &&
      !isStory(file) &&
      !rel.startsWith("src/docs/") &&
      !rel.startsWith("src/test/")
    )
      tsxRules(root, file, out);
    if (
      rel.startsWith("src/components/") &&
      (file.endsWith(".css") || (file.endsWith(".tsx") && !isStory(file)))
    )
      literalRules(root, file, out);
    if (/\.(tsx?|css|md)$/.test(file)) {
      const text = readFileSync(file, "utf8");
      for (const m of text.matchAll(/TODO\(cy\)/g))
        out.push({
          rule: "scaffold-todo",
          file: rel,
          line: lineOf(text, m.index ?? 0),
          message: "finish the scaffold: replace TODO(cy)",
        });
    }
  }
  structureRules(root, out);
  return out;
}
