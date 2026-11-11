/**
 * Renders a parsed Markdown document with Cynosure components: text in Prose, code in CodeBlock, tables in Table,
 * links as Link, GitHub-style callouts as Notice. The tree comes from `engine/build/markdown.ts`.
 */
import { CodeBlock, IconButton, Kbd, Link, Notice, Table } from "@arshad-shah/cynosure";
import { link as linkIcon } from "@arshad-shah/cynosure/icons";
import type { Blockquote, Code, Heading, Table as MdTable, PhrasingContent, RootContent } from "mdast";
import { Fragment, type ReactNode } from "react";
import type { CodeToken } from "../types";

/** Code coloured by Cynosure's `syntax.css`, which styles Prism's class names. */
export function Tokens({ lines }: { lines: CodeToken[][] }) {
  return (
    <>
      {lines.map((line, row) => (
        <Fragment key={row}>
          {row > 0 && "\n"}
          {line.map(([text, kind], column) =>
            kind ? (
              <span key={column} className={`token ${kind}`}>
                {text}
              </span>
            ) : (
              text
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}

const plain = (nodes: readonly (PhrasingContent | RootContent)[]): string =>
  nodes
    .map((node) => ("value" in node ? node.value : "children" in node ? plain(node.children) : ""))
    .join("");

function Inline({ nodes }: { nodes: readonly PhrasingContent[] }): ReactNode {
  return nodes.map((node, index) => {
    const key = index;
    switch (node.type) {
      case "text":
        return node.value;
      case "strong":
        return (
          <strong key={key}>
            <Inline nodes={node.children} />
          </strong>
        );
      case "emphasis":
        return (
          <em key={key}>
            <Inline nodes={node.children} />
          </em>
        );
      case "delete":
        return (
          <del key={key}>
            <Inline nodes={node.children} />
          </del>
        );
      case "inlineCode":
        return <code key={key}>{node.value}</code>;
      case "break":
        return <br key={key} />;
      case "link":
        return (
          <Link key={key} href={node.url} size="inherit" external={/^https?:/.test(node.url)}>
            <Inline nodes={node.children} />
          </Link>
        );
      case "image":
        return <img key={key} src={node.url} alt={node.alt ?? ""} loading="lazy" />;
      default:
        // `<kbd>Enter</kbd>` in the source (see engine/build/markdown.ts).
        if ((node.type as string) === "kbd")
          return <Kbd key={key} size="sm" keys={[(node as unknown as { value: string }).value]} />;
        return "children" in node ? <Inline key={key} nodes={node.children as PhrasingContent[]} /> : null;
    }
  });
}

const TONES = {
  note: "info",
  tip: "success",
  important: "accent",
  warning: "warning",
  caution: "danger",
} as const;
const TITLES = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
} as const;

/** `> [!NOTE]` and friends, as GitHub writes callouts. */
function callout(node: Blockquote): { kind: keyof typeof TONES; rest: RootContent[] } | null {
  const first = node.children[0];
  const text = first?.type === "paragraph" ? first.children[0] : undefined;
  if (text?.type !== "text") return null;
  const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/.exec(text.value);
  if (!match || first?.type !== "paragraph") return null;
  const remaining = [{ ...text, value: text.value.slice(match[0].length) }, ...first.children.slice(1)];
  const lead = {
    ...first,
    children: remaining.filter((child) => child.type !== "text" || child.value.trim()),
  };
  return {
    kind: (match[1] as string).toLowerCase() as keyof typeof TONES,
    rest: [...(lead.children.length ? [lead] : []), ...node.children.slice(1)],
  };
}

function DataTable({ node, caption }: { node: MdTable; caption: string }) {
  const [head, ...body] = node.children;
  if (!head) return null;
  const rows = body.map((row, index) => ({ id: String(index), cells: row.children }));
  return (
    <Table
      caption={caption}
      captionHidden
      getRowId={(row) => row.id}
      rows={rows}
      columns={head.children.map((cell, column) => ({
        key: String(column),
        header: <Inline nodes={cell.children} />,
        rowHeader: column === 0,
        ...(node.align?.[column] === "right" ? { align: "end" as const } : {}),
        cell: (row: (typeof rows)[number]) => <Inline nodes={row.cells[column]?.children ?? []} />,
      }))}
    />
  );
}

/** What a document can place besides text: a canvas of named examples and the component's props table. */
export interface Blocks {
  canvas?: (stories: string[]) => ReactNode;
  props?: () => ReactNode;
}

export function Markdown({
  nodes,
  level = 0,
  blocks,
}: {
  nodes: readonly RootContent[];
  level?: number;
  blocks?: Blocks;
}): ReactNode {
  let section = "";
  let tables = 0;
  return nodes.map((node, index) => {
    const key = index;
    switch (node.type) {
      case "heading": {
        const heading = node as Heading & { id?: string };
        section = plain(heading.children);
        // The page title is the only h1; with `level`, a nested document's headings sit under their parent's.
        const Tag = `h${Math.min(6, Math.max(2, heading.depth + level))}` as "h2";
        return (
          <Tag key={key} id={heading.id} className="docs-heading">
            <Inline nodes={heading.children} />
            {heading.id && (
              <IconButton
                className="docs-anchor"
                icon={linkIcon}
                label={`Link to "${section}"`}
                href={`#${heading.id}`}
                size="sm"
                variant="ghost"
              />
            )}
          </Tag>
        );
      }
      case "paragraph":
        return (
          <p key={key}>
            <Inline nodes={node.children} />
          </p>
        );
      case "list": {
        const Tag = node.ordered ? "ol" : "ul";
        return (
          <Tag key={key} {...(node.ordered && node.start && node.start !== 1 ? { start: node.start } : {})}>
            {node.children.map((item, at) => (
              <li key={at}>
                {item.children.length === 1 && item.children[0]?.type === "paragraph" ? (
                  <Inline nodes={item.children[0].children} />
                ) : (
                  <Markdown nodes={item.children} level={level} />
                )}
              </li>
            ))}
          </Tag>
        );
      }
      case "blockquote": {
        const found = callout(node);
        if (found)
          return (
            <div key={key} className="docs-block">
              <Notice tone={TONES[found.kind]} title={TITLES[found.kind]}>
                <Markdown nodes={found.rest} level={level} />
              </Notice>
            </div>
          );
        return (
          <blockquote key={key}>
            <Markdown nodes={node.children} level={level} />
          </blockquote>
        );
      }
      case "code": {
        const code = node as Code & { tokens?: CodeToken[][] };
        const { tokens } = code;
        return (
          <div key={key} className="docs-block">
            <CodeBlock
              code={code.value}
              language={code.lang ?? undefined}
              {...(code.meta ? { title: code.meta } : {})}
              {...(tokens ? { highlight: () => <Tokens lines={tokens} /> } : {})}
            />
          </div>
        );
      }
      case "table": {
        tables += 1;
        return (
          <div key={key} className="docs-block">
            <DataTable node={node} caption={section ? `${section}, table ${tables}` : `Table ${tables}`} />
          </div>
        );
      }
      case "thematicBreak":
        return <hr key={key} />;
      default: {
        const custom = node as unknown as { type: string; stories?: string[] };
        if (custom.type === "canvas")
          return <Fragment key={key}>{blocks?.canvas?.(custom.stories ?? [])}</Fragment>;
        if (custom.type === "props") return <Fragment key={key}>{blocks?.props?.()}</Fragment>;
        return null;
      }
    }
  });
}
