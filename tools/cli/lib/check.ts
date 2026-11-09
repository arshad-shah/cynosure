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

/** Classes whose own rule declares a font size (so a host `* { font-size }` cannot change them). */
function fontClasses(root: string): Set<string> {
  const found = new Set<string>();
  for (const file of walk(join(root, "src")).filter((f) => f.endsWith(".css"))) {
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const stack: { selector: string; own: string }[] = [];
    let buffer = "";
    for (const ch of css) {
      if (ch === "{") {
        stack.push({ selector: buffer.trim(), own: "" });
        buffer = "";
      } else if (ch === "}") {
        const block = stack.pop();
        if (block && /(^|[;\s])font(-size)?\s*:/.test(`${block.own};${buffer}`))
          for (const part of block.selector.split(",")) {
            const classes = part.match(/\.cy-[a-z0-9-]+/g);
            const last = classes?.at(-1);
            if (last && !part.trim().startsWith("&")) found.add(last.slice(1));
          }
        buffer = "";
      } else if (ch === ";" && stack.length) {
        (stack.at(-1) as { own: string }).own += `${buffer};`;
        buffer = "";
      } else buffer += ch;
    }
  }
  return found;
}

/** Hidden or structural classes that never render text, so they cannot leak a host font size. */
const INHERIT_EXEMPT = new Set([
  "cy-visually-hidden",
  "cy-hidden-value",
  "cy-choice-input",
  "cy-motion-trigger",
]);

function staticClassText(node: ts.JsxAttribute, source: ts.SourceFile): string {
  const init = node.initializer;
  if (!init) return "";
  if (ts.isStringLiteral(init)) return init.text;
  if (ts.isJsxExpression(init) && init.expression) {
    const e = init.expression;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
    if (ts.isTemplateExpression(e))
      return [e.head.text, ...e.templateSpans.map((t) => t.literal.text)].join(" ");
    return (
      e
        .getText(source)
        .match(/cy-[a-z0-9-]+/g)
        ?.join(" ") ?? ""
    );
  }
  return "";
}

function tsxRules(root: string, file: string, out: Violation[], fonts: Set<string>) {
  const rel = relative(root, file);
  const text = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const inFoundations = rel.startsWith("src/foundations/");
  const at = (node: ts.Node) => source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  const push = (rule: string, node: ts.Node, message: string) =>
    out.push({ rule, file: rel, line: at(node), message });
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      const intrinsic = /^[a-z]/.test(tag);
      if (!inFoundations && NATIVE.has(tag))
        push("native-elements", node, `<${tag}> outside src/foundations; use the Cynosure component`);
      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr)) continue;
        const name = attr.name.getText(source);
        if (intrinsic && name === "title")
          push("title-attr", attr, "title= creates a native tooltip; use Tooltip or a label");
        if (intrinsic && name === "className") {
          const classes = staticClassText(attr, source)
            .split(/\s+/)
            .filter((c) => c.startsWith("cy-") && !c.endsWith("-"));
          const safe = classes.some((c) => c === "cy-reset" || fonts.has(c) || INHERIT_EXEMPT.has(c));
          if (classes.length && !safe)
            push(
              "inherit-chain",
              attr,
              `.${classes[0]} must carry cy-reset or declare font-size (host * rules would resize it)`,
            );
        }
      }
    }
    if (
      !inFoundations &&
      ts.isCallExpression(node) &&
      node.expression.getText(source).endsWith("createElement") &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0]) &&
      NATIVE.has(node.arguments[0].text)
    )
      push("native-elements", node, `createElement("${node.arguments[0].text}") outside src/foundations`);
    if (ts.isJsxText(node) && GLYPHS.test(node.getText(source)))
      push("glyphs", node, "text or emoji glyph used as an icon; use <Icon>");
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression)) &&
      GLYPHS.test(node.expression.text)
    )
      push("glyphs", node, "text or emoji glyph used as an icon; use <Icon>");
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

const RELATIVE_IMPORT = /(?:from\s*|import\s*\(\s*|import\s+)["'](\.{1,2}\/[^"']+)["']/g;

/** Relative imports in shipped source need explicit .js extensions so emitted .d.ts files resolve under Node ESM. */
function importRules(root: string, file: string, out: Violation[]) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(RELATIVE_IMPORT))
    if (!/\.(js|css|json|mdx|svg)$/.test(m[1] ?? ""))
      out.push({
        rule: "import-extensions",
        file: relative(root, file),
        line: lineOf(text, m.index ?? 0),
        message: `import "${m[1]}" needs a .js extension (or /index.js)`,
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
      const page = join(folder, `${name}.mdx`);
      // Docs pages follow the same rule as code: no text glyphs standing in for icons or arrows.
      if (existsSync(page))
        readFileSync(page, "utf8")
          .split("\n")
          .forEach((text, i) => {
            if (GLYPHS.test(text))
              out.push({
                rule: "glyphs",
                file: relative(root, page),
                line: i + 1,
                message: "text glyph in a docs page: write the word (Left arrow, use X) or show an Icon",
              });
          });
      if (!existsSync(page) || !readFileSync(page, "utf8").includes("<Meta of={Stories}"))
        out.push({
          rule: "docs",
          file: rel,
          line: 1,
          message: `needs a hand-written ${name}.mdx docs page with <Meta of={Stories} /> (what it is, when to use it, examples, props, accessibility, tokens)`,
        });
    }
  }
}

/** Folders that must carry an AGENTS.md with their local rules and recipes. */
export const AGENT_FOLDERS = [
  "src/tokens",
  "src/foundations",
  "src/components",
  "src/icons",
  "src/theme",
  "src/adapters",
  "tools/cli",
  ".storybook",
  "docs",
] as const;

function agentRules(root: string, out: Violation[]) {
  if (!existsSync(join(root, "AGENTS.md")))
    out.push({ rule: "agents", file: ".", line: 1, message: "root AGENTS.md is missing" });
  for (const folder of AGENT_FOLDERS)
    if (existsSync(join(root, folder)) && !existsSync(join(root, folder, "AGENTS.md")))
      out.push({
        rule: "agents",
        file: folder,
        line: 1,
        message: "needs an AGENTS.md with this folder's rules",
      });
}

export function check(root: string): Violation[] {
  const out: Violation[] = [];
  const fonts = fontClasses(root);
  const files = walk(join(root, "src"));
  for (const file of files) {
    const rel = relative(root, file);
    if (
      file.endsWith(".tsx") &&
      !isStory(file) &&
      !rel.startsWith("src/docs/") &&
      !rel.startsWith("src/test/")
    )
      tsxRules(root, file, out, fonts);
    if (
      /\.tsx?$/.test(file) &&
      !isStory(file) &&
      !rel.startsWith("src/docs/") &&
      !rel.startsWith("src/test/")
    )
      importRules(root, file, out);
    if (
      (rel.startsWith("src/components/") || rel.startsWith("src/foundations/")) &&
      (file.endsWith(".css") || (file.endsWith(".tsx") && !isStory(file)))
    )
      literalRules(root, file, out);
    if (/\.(tsx?|css|mdx?)$/.test(file) && !file.endsWith("AGENTS.md")) {
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
  agentRules(root, out);
  return out;
}
