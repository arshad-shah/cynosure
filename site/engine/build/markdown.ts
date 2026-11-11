/**
 * Markdown in, page data out. A document is parsed once at build time into a small tree the app renders with
 * Cynosure components (`engine/app/Markdown.tsx`): headings get ids, code is tokenised for colour, and links between
 * repository files are pointed at their pages.
 */
import { dirname, posix } from "node:path";
import GithubSlugger from "github-slugger";
import type { Code, Heading, Link, Nodes, Root, RootContent } from "mdast";
import { toString as textOf } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { bundledLanguages, createCssVariablesTheme, createHighlighter, type Highlighter } from "shiki";
import { unified } from "unified";
import type { CodeToken, TocEntry } from "../types.ts";

export interface Parsed {
  /** The document's first heading. */
  title: string;
  /** Its first paragraph, as plain text: the page's lead and description. */
  lead: string;
  /** Everything after the title and lead. */
  body: RootContent[];
  toc: TocEntry[];
  /** Plain text of the whole document, for search. */
  text: string;
}

export interface LinkContext {
  /** The document's path, relative to the repository root. */
  source: string;
  /** The site route of a repository path, or null when it has no page. */
  routeOf: (repoPath: string) => string | null;
  /** Where a file without a page is linked, e.g. `https://github.com/o/r/blob/main`. */
  blob: string;
  /** True for a repository file the site deliberately leaves out: rows and list items that lead to one are dropped. */
  hidden?: (repoPath: string) => boolean;
  /** This site's own address, e.g. `https://docs.example.com`: a link to it is a link within the site. */
  site?: string;
  /** Where a Storybook address (`?path=/docs/components-button--docs`) leads on the site, when it has a page. */
  storybook?: (query: string) => string | null;
}

const parser = unified().use(remarkParse).use(remarkGfm);

/** Shiki's CSS-variables theme names each colour; Cynosure's `syntax.css` colours the matching Prism classes. */
const KINDS: Record<string, string> = {
  "token-comment": "comment",
  "token-constant": "number",
  "token-function": "function",
  "token-keyword": "keyword",
  "token-parameter": "variable",
  "token-punctuation": "punctuation",
  "token-string": "string",
  "token-string-expression": "string",
};
const ALIASES: Record<string, string> = { sh: "bash", shell: "bash", console: "bash", text: "", txt: "" };

let highlighter: Promise<Highlighter> | undefined;
const theme = createCssVariablesTheme({ name: "docs", variablePrefix: "--s-" });

async function tokens(code: string, language: string | null | undefined): Promise<CodeToken[][] | undefined> {
  const lang = ALIASES[language ?? ""] ?? language ?? "";
  if (!lang || !(lang in bundledLanguages)) return undefined;
  highlighter ??= createHighlighter({ themes: [theme], langs: [] });
  const shiki = await highlighter;
  if (!shiki.getLoadedLanguages().includes(lang))
    await shiki.loadLanguage(lang as keyof typeof bundledLanguages);
  const lines = shiki.codeToTokensBase(code, { lang: lang as keyof typeof bundledLanguages, theme });
  return lines.map((line) => {
    const out: CodeToken[] = [];
    for (const token of line) {
      const kind = KINDS[/var\(--s-([a-z-]+)\)/.exec(token.color ?? "")?.[1] ?? ""];
      const last = out[out.length - 1];
      // Neighbouring runs of one kind are joined, which keeps the page data small.
      if (last && last[1] === kind) last[0] += token.content;
      else out.push(kind ? [token.content, kind] : [token.content]);
    }
    return out;
  });
}

/** A link written in a repository file, as the site should follow it. */
export function rewriteLink(url: string, context: LinkContext): string {
  if (url.startsWith("?path=")) return context.storybook?.(url) ?? url;
  // A full address of this site (a README read on GitHub needs one) is a path here, not another site.
  if (context.site && url.startsWith(`${context.site}/`)) return url.slice(context.site.length);
  if (/^[a-z][a-z0-9+.-]*:|^\/\/|^#|^\?/i.test(url)) return url;
  if (url.startsWith("/")) return url;
  const [path = "", hash = ""] = url.split("#");
  const target = posix.normalize(posix.join(dirname(context.source), path));
  const anchor = hash ? `#${hash}` : "";
  const route = context.routeOf(target);
  return route ? route + anchor : `${context.blob}/${target}${anchor}`;
}

function strip(node: Nodes) {
  delete node.position;
  if ("children" in node) for (const child of node.children) strip(child);
}

/**
 * A Storybook docs page (`.mdx`) as plain Markdown: its imports and `<Meta>` go, a run of `<Canvas of={Stories.X} />`
 * lines becomes one block naming those stories, and `<ArgTypes>` becomes the props table's place.
 */
export function fromDocsPage(mdx: string): string {
  const out: string[] = [];
  let canvas: string[] = [];
  let fenced = false;
  const flush = () => {
    if (canvas.length) out.push("```docs-canvas", ...canvas, "```", "");
    canvas = [];
  };
  for (const line of mdx.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    const story = fenced ? null : /^<Canvas\s+of=\{Stories\.([A-Za-z0-9_]+)\}\s*\/>\s*$/.exec(line)?.[1];
    if (story) {
      canvas.push(story);
      continue;
    }
    // Blank lines between two canvases keep them one group.
    if (canvas.length && !line.trim()) continue;
    flush();
    if (!fenced && /^(import\s.+from\s+"[^"]+";?|<Meta\s[^>]*\/>)\s*$/.test(line)) continue;
    if (!fenced && /^<ArgTypes\s[^>]*\/>\s*$/.test(line)) out.push("```docs-props", "```");
    else out.push(line);
  }
  flush();
  return out.join("\n");
}

/** `<kbd>Enter</kbd>` written inline becomes one node the app draws with Kbd; other inline HTML is dropped. */
function inlineHtml(node: Nodes) {
  if (!("children" in node)) return;
  const children = node.children as Nodes[];
  for (let at = 0; at < children.length; at++) {
    const open = children[at];
    if (open?.type !== "html") continue;
    const text = children[at + 1];
    const close = children[at + 2];
    if (
      /^<kbd>$/i.test(open.value) &&
      text?.type === "text" &&
      close?.type === "html" &&
      /^<\/kbd>$/i.test(close.value)
    )
      children.splice(at, 3, { type: "kbd", value: text.value } as unknown as Nodes);
    else if (/^<br\s*\/?>$/i.test(open.value)) children.splice(at, 1, { type: "break" });
    else children.splice(at--, 1);
  }
  for (const child of children) inlineHtml(child);
}

export async function parseMarkdown(markdown: string, context: LinkContext): Promise<Parsed> {
  const tree = parser.parse(markdown) as Root;
  strip(tree);
  // Raw HTML (a centred logo at the top of a README) has no place on the page; YAML and comments neither.
  let body = tree.children.filter((node) => node.type !== "html" && node.type !== "yaml");
  for (const node of body) inlineHtml(node);

  let title = "";
  const first = body[0];
  if (first?.type === "heading" && first.depth === 1) {
    title = textOf(first);
    body = body.slice(1);
  }
  let lead = "";
  if (body[0]?.type === "paragraph") {
    lead = textOf(body[0]).replace(/\s+/g, " ").trim();
    body = body.slice(1);
  }

  // A table row or list item that exists to point at a file the site leaves out (an internal note) goes with it.
  const firstLink = (node: Nodes): string | undefined => {
    if (node.type === "link") return node.url;
    if ("children" in node)
      for (const child of node.children) {
        const found = firstLink(child);
        if (found !== undefined) return found;
      }
    return undefined;
  };
  const leadsToHidden = (node: Nodes) => {
    const url = firstLink(node);
    if (!url || /^[a-z][a-z0-9+.-]*:|^[#?/]/i.test(url)) return false;
    const target = posix.normalize(posix.join(dirname(context.source), url.split("#")[0] ?? ""));
    return context.hidden?.(target) ?? false;
  };
  const prune = (node: Nodes) => {
    if (!("children" in node)) return;
    if (node.type === "table" || node.type === "list")
      (node as { children: Nodes[] }).children = (node.children as Nodes[]).filter(
        (child) => !leadsToHidden(child),
      );
    for (const child of node.children) prune(child);
  };
  for (const node of body) prune(node);
  // A paragraph that sends the reader to this site ("Documentation: https://…" in a README) says nothing here.
  const self = (url: string | undefined) =>
    context.site !== undefined && url !== undefined && url.replace(/\/$/, "") === context.site;
  body = body.filter((node) => !(node.type === "paragraph" && self(firstLink(node))));

  const slugger = new GithubSlugger();
  const toc: TocEntry[] = [];
  const pending: Promise<void>[] = [];
  const visit = (node: Nodes) => {
    if (node.type === "heading") {
      const heading = node as Heading & { id?: string };
      const text = textOf(heading);
      heading.id = slugger.slug(text);
      if (heading.depth === 2 || heading.depth === 3)
        toc.push({ id: heading.id, text, depth: heading.depth });
    } else if (node.type === "link") {
      (node as Link).url = rewriteLink((node as Link).url, context);
      // A Storybook address with nowhere to lead on this site: keep the words, drop the link.
      if ((node as Link).url.startsWith("?path=")) Object.assign(node, { type: "span", url: undefined });
    } else if (node.type === "code" && node.lang === "docs-canvas") {
      Object.assign(node, { type: "canvas", stories: node.value.split("\n").filter(Boolean) });
    } else if (node.type === "code" && node.lang === "docs-props") {
      Object.assign(node, { type: "props" });
    } else if (node.type === "code") {
      const code = node as Code & { tokens?: CodeToken[][] };
      pending.push(
        tokens(code.value, code.lang).then((lines) => {
          if (lines) code.tokens = lines;
        }),
      );
    }
    if ("children" in node) for (const child of node.children) visit(child);
  };
  for (const node of body) visit(node);
  await Promise.all(pending);

  const text = body
    .filter((node) => !["code", "canvas", "props"].includes(node.type as string))
    .map((node) => textOf(node))
    .join(" ")
    .replace(/\s+/g, " ");
  return { title, lead, body, toc, text };
}
