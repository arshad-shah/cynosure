/** Generators behind `cy new …`. Deterministic: same input, same files; refuses to overwrite. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { IconCategory, IconData, IconNode } from "../../../src/icons/types";
import { validateIcon } from "../../../src/icons/validate";

/** `IconButton` → `icon-button`, `QRCode` → `qr-code` (the same names `cy check` expects). */
const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
const camel = (s: string) => s.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
const RESERVED = new Set([
  "package",
  "delete",
  "new",
  "default",
  "import",
  "export",
  "function",
  "class",
  "interface",
  "public",
  "private",
  "static",
  "let",
  "yield",
  "await",
  "enum",
  "case",
  "switch",
  "return",
  "var",
  "void",
  "with",
  "in",
  "of",
  "do",
  "if",
  "for",
  "while",
  "try",
  "catch",
  "finally",
  "throw",
  "typeof",
  "instanceof",
  "this",
  "super",
  "null",
  "true",
  "false",
]);
/** Export identifier for an icon name; reserved words get an `Icon` suffix (`package` → `packageIcon`). */
export const iconId = (name: string) => (RESERVED.has(camel(name)) ? `${camel(name)}Icon` : camel(name));
/** The token group key: `IconButton` → `iconButton`, `QRCode` → `qrCode`. */
const lowerFirst = (s: string) => camel(kebab(s));

/** Sorts whole `export { … } from "…";` statements (they may span several lines once formatted). */
export function sortExports(text: string): string {
  const statements = text.match(/export[\s\S]*?;\s*(?:\n|$)/g) ?? [];
  const clean = statements.map((s) => s.trim());
  const named = clean.filter((s) => s.startsWith("export {")).sort((a, b) => a.localeCompare(b));
  const rest = clean.filter((s) => !s.startsWith("export {"));
  return `${[...named, ...rest].join("\n")}\n`;
}

const tsx = (
  Name: string,
  k: string,
) => `import { type CSSProperties, forwardRef, type ReactNode } from "react";
import type { Size, Tone } from "../../tokens/schema.js";

export interface ${Name}Tokens {
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    ${lowerFirst(Name)}: ${Name}Tokens;
  }
}

export interface ${Name}Props {
  /** Physical size (shared vocabulary: docs/conventions.md). */
  size?: Size;
  /** Semantic colour. */
  tone?: Tone;
  className?: string;
  /** Layout only. Restyle through --cy-${k}-* tokens. */
  style?: CSSProperties;
  children?: ReactNode;
}

/** TODO(cy): one line on what ${Name} is for. Compose Cynosure components; native elements only in foundations. */
export const ${Name} = forwardRef<HTMLDivElement, ${Name}Props>(function ${Name}(
  { size = "md", tone = "neutral", className, style, children },
  ref,
) {
  return (
    <div
      ref={ref}
      className={\`cy-${k}\${className ? \` \${className}\` : ""}\`}
      data-size={size}
      data-tone={tone}
      style={style}
    >
      {children}
    </div>
  );
});
`;

const css = (
  k: string,
) => `/* ${k}: every visual property reads a --cy-${k}-* token with a global fallback. Root never carries .cy-reset. */
.cy-${k}.cy-${k} {
  --_tone: var(--cy-color-ink);
  box-sizing: border-box !important;
  margin: 0;
  letter-spacing: normal;
  text-transform: none;
  display: flex;
  gap: var(--cy-${k}-gap, var(--cy-space-4));
  color: var(--_tone);
  font-family: var(--cy-font-sans);
  font-size: var(--cy-font-size-md);
  &[data-size="sm"] { font-size: var(--cy-font-size-sm); }
  &[data-size="lg"] { font-size: var(--cy-font-size-lg); }
  &[data-tone="accent"] { --_tone: var(--cy-color-accent-text); }
  &[data-tone="danger"] { --_tone: var(--cy-color-danger-text); }
  &[data-tone="success"] { --_tone: var(--cy-color-success-text); }
  &[data-tone="warning"] { --_tone: var(--cy-color-warning-text); }
  &[data-tone="info"] { --_tone: var(--cy-color-info-text); }
}
`;

const stories = (
  Name: string,
  k: string,
  group: string,
) => `import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { TONES } from "../../tokens/schema.js";
import { ${Name} } from "./${Name}.js";

const meta = {
  title: "${group}/${Name}",
  component: ${Name},
  args: { children: "${Name}", size: "md", tone: "neutral" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: TONES },
  },
} satisfies Meta<typeof ${Name}>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    // TODO(cy): replace with behaviour tests (pointer, keyboard, touch, focus, values, disabled).
    await expect(canvas.getByText("${Name}")).toBeVisible();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-${k}", ["display", "gap", "font-size", "box-sizing"]);
    await expect(hostile).toEqual(clean);
  },
};
`;

const readme = (
  Name: string,
  k: string,
  kind: string,
) => `# ${Name}${kind === "foundation" ? " (foundation)" : ""}

TODO(cy): what ${Name} is for, in one paragraph.

\`\`\`tsx
import { ${Name} } from "@arshad-shah/cynosure";

<${Name}>…</${Name}>
\`\`\`

| Prop | Default | Notes |
|---|---|---|
| \`size\` | \`md\` | \`sm\` · \`md\` · \`lg\` |
| \`tone\` | \`neutral\` | \`accent\` · \`neutral\` · \`danger\` · \`success\` · \`warning\` · \`info\` |
| \`className\` / \`style\` | – | Layout only |

## Tokens
- \`--cy-${k}-gap\`: space between children
`;

const docsPage = (
  Name: string,
  k: string,
) => `import { ArgTypes, Canvas, Meta } from "@storybook/addon-docs/blocks";
import * as Stories from "./${Name}.stories";

<Meta of={Stories} />

# ${Name}

TODO(cy): what ${Name} is, in one or two sentences, and what to use instead when it is the wrong fit.

<Canvas of={Stories.Default} />

## When to use

TODO(cy): when to reach for ${Name}, and "Use something else when" with links to the alternatives.

## Usage

\`\`\`tsx
import { ${Name} } from "@arshad-shah/cynosure";

<${Name}>…</${Name}>
\`\`\`

## Props

<ArgTypes of={Stories} />

## Behaviour and accessibility

TODO(cy): keyboard table, focus, announcements, touch. Only what the stories prove.

## Theming

Tokens: \`--cy-${k}-gap\`.

## Related

TODO(cy): links to related components.
`;

/** `cy new component <Name> --kind foundation|composite` */
export function scaffoldComponent(root: string, Name: string, kind: "foundation" | "composite"): string[] {
  if (!/^[A-Z][A-Za-z0-9]+$/.test(Name)) throw new Error(`Component names are PascalCase: got "${Name}"`);
  const group = kind === "foundation" ? "foundations" : "components";
  const dir = join(root, "src", group, Name);
  const taken = ["foundations", "components"].some((g) => existsSync(join(root, "src", g, Name)));
  if (taken) throw new Error(`${Name} already exists`);
  const k = kebab(Name);
  mkdirSync(dir, { recursive: true });
  const files: Record<string, string> = {
    [`${Name}.tsx`]: tsx(Name, k),
    [`${k}.css`]: css(k),
    [`${Name}.stories.tsx`]: stories(Name, k, kind === "foundation" ? "Foundations" : "Components"),
    "README.md": readme(Name, k, kind),
    [`${Name}.mdx`]: docsPage(Name, k),
    "index.ts": `export { ${Name}, type ${Name}Props, type ${Name}Tokens } from "./${Name}.js";\n`,
  };
  for (const [file, text] of Object.entries(files)) writeFileSync(join(dir, file), text);
  const index = join(root, "src/index.ts");
  writeFileSync(
    index,
    sortExports(
      `${readFileSync(index, "utf8")}export { ${Name}, type ${Name}Props } from "./${group}/${Name}/index.js";\n`,
    ),
  );
  const sizes = join(root, ".size-limit.json");
  const budget = JSON.parse(readFileSync(sizes, "utf8")) as object[];
  budget.push({
    name: `${Name} (JS + CSS)`,
    path: [`dist/${group}/${Name}/${Name}.js`, `dist/styles/${k}.css`],
    limit: "3 kB",
    gzip: true,
  });
  writeFileSync(sizes, `${JSON.stringify(budget, null, 2)}\n`);
  return Object.keys(files).map((f) => join(dir, f));
}

/** `cy new token <component.tokenName> --doc "<text>"`: adds a typed component token and documents it. */
export function addComponentToken(root: string, path: string, doc: string): void {
  const [component = "", token = ""] = path.split(".");
  if (!/^[a-z][A-Za-z0-9]*$/.test(component) || !/^[a-z][A-Za-z0-9]*$/.test(token))
    throw new Error(`Token paths look like "button.ringColor": got "${path}"`);
  const Name = component.charAt(0).toUpperCase() + component.slice(1);
  const dir = ["components", "foundations"].map((g) => join(root, "src", g, Name)).find(existsSync);
  if (!dir) throw new Error(`No component named ${Name}`);
  const file = join(dir, `${Name}.tsx`);
  const text = readFileSync(file, "utf8");
  const anchor = `export interface ${Name}Tokens {\n`;
  if (!text.includes(anchor)) throw new Error(`${Name}.tsx has no ${Name}Tokens interface`);
  if (new RegExp(`\\n\\s+${token}: string;`).test(text)) throw new Error(`${path} already exists`);
  writeFileSync(file, text.replace(anchor, `${anchor}  ${token}: string;\n`));
  const readmePath = join(dir, "README.md");
  const line = `- \`--cy-${kebab(component)}-${kebab(token)}\`: ${doc}\n`;
  const md = readFileSync(readmePath, "utf8");
  writeFileSync(
    readmePath,
    md.includes("## Tokens\n")
      ? md.replace("## Tokens\n", `## Tokens\n${line}`)
      : `${md}\n## Tokens\n${line}`,
  );
}

const num = (v: string | undefined) => Number.parseFloat(v ?? "0");

/** Parses the subset of SVG Facet icons use: stroked paths, rects and circles; no fills, no text. */
export function svgToIcon(name: string, svg: string, category: IconCategory): IconData {
  if (/<text[\s>]/i.test(svg)) throw new Error("SVG contains <text>: icons are drawn, never typed");
  const body: IconNode[] = [];
  for (const [, tag, attrText = ""] of svg.matchAll(/<(path|rect|circle)\b([^>]*)\/?>/g)) {
    const a = Object.fromEntries([...attrText.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    if (a.fill && a.fill !== "none") throw new Error(`${tag} has a fill: Facet icons are stroke only`);
    if (tag === "path") body.push(["path", { d: a.d ?? "" }]);
    if (tag === "rect")
      body.push([
        "rect",
        {
          x: num(a.x),
          y: num(a.y),
          width: num(a.width),
          height: num(a.height),
          ...(a.rx ? { rx: num(a.rx) } : {}),
        },
      ]);
    if (tag === "circle") body.push(["circle", { cx: num(a.cx), cy: num(a.cy), r: num(a.r) }]);
  }
  return { name, category, body };
}

const literal = (v: unknown): string =>
  Array.isArray(v)
    ? `[${v.map(literal).join(", ")}]`
    : v && typeof v === "object"
      ? `{ ${Object.entries(v)
          .map(([k, x]) => `${k}: ${literal(x)}`)
          .join(", ")} }`
      : JSON.stringify(v);

/** `cy new icon <name> --from file.svg` */
export function scaffoldIcon(root: string, name: string, svg: string, category: IconCategory): string {
  const icon = svgToIcon(name, svg, category);
  const errors = validateIcon(icon);
  if (errors.length) throw new Error(`Icon "${name}" is not a valid Facet icon:\n- ${errors.join("\n- ")}`);
  const file = join(root, "src/icons", `${name}.ts`);
  if (existsSync(file)) throw new Error(`Icon ${name} already exists`);
  const id = iconId(name);
  writeFileSync(
    file,
    `import type { IconData } from "./types.js";\n\nexport const ${id}: IconData = {\n  name: ${JSON.stringify(name)},\n  category: ${JSON.stringify(category)},\n  body: ${literal(icon.body)},\n};\n`,
  );
  // Icons are listed in facet.ts (re-exported by index.ts and read by by-name.ts), one export each.
  const index = join(root, "src/icons/facet.ts");
  writeFileSync(index, sortExports(`${readFileSync(index, "utf8")}export { ${id} } from "./${name}.js";\n`));
  return file;
}
