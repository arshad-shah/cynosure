/**
 * Writes the code for a live example from what it renders: the components, their props and their text, as a person
 * would type them, with the import lines on top. Test attributes and layout-only wrappers are left out. An example
 * built from a helper that is not part of the package cannot be written this way, and gets no code.
 */
import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";

interface Written {
  lines: string[];
  components: Set<string>;
  icons: Set<string>;
}

class Unwritable extends Error {}

const camel = (name: string) =>
  name.replace(/[-_ ]+([a-z0-9])/gi, (_, letter: string) => letter.toUpperCase());
const isIcon = (value: unknown): value is { name: string } =>
  typeof value === "object" && value !== null && "body" in value && "name" in value;

function nameOf(type: unknown): string | null {
  if (typeof type === "string") return type;
  if (typeof type === "function") return (type as { displayName?: string }).displayName ?? type.name ?? null;
  if (typeof type === "object" && type !== null) {
    const wrapped = type as { displayName?: string; render?: unknown; type?: unknown };
    return wrapped.displayName ?? nameOf(wrapped.render ?? wrapped.type);
  }
  return null;
}

/** `onClick` is written as `handleClick`: the reader's own function goes there. */
const handler = (prop: string) => `handle${prop.replace(/^on/, "")}`;

export function writeJsx(node: ReactNode, known: ReadonlySet<string>, pkg: string): string | null {
  const out: Written = { lines: [], components: new Set(), icons: new Set() };

  const value = (prop: string, input: unknown, depth: number): string | null => {
    if (input === undefined || input === null) return null;
    if (typeof input === "string") return JSON.stringify(input);
    if (typeof input === "number" || typeof input === "boolean") return `{${input}}`;
    if (typeof input === "function") return `{${handler(prop)}}`;
    if (isValidElement(input))
      return `{${element(input, depth + 1)
        .join("\n")
        .trim()}}`;
    return `{${literal(input)}}`;
  };
  const literal = (input: unknown): string => {
    if (isIcon(input)) {
      out.icons.add(camel(input.name));
      return camel(input.name);
    }
    if (typeof input === "function") return "() => {}";
    if (isValidElement(input)) return element(input, 0).join(" ").trim();
    if (Array.isArray(input)) return `[${input.map(literal).join(", ")}]`;
    if (input instanceof Date) return `new Date(${JSON.stringify(input.toISOString())})`;
    if (typeof input === "object" && input !== null)
      return `{ ${Object.entries(input)
        .filter(([, each]) => each !== undefined)
        .map(([key, each]) => `${/^[a-z_$][\w$]*$/i.test(key) ? key : JSON.stringify(key)}: ${literal(each)}`)
        .join(", ")} }`;
    return JSON.stringify(input) ?? "undefined";
  };

  const children = (input: ReactNode, depth: number): string[] => {
    const lines: string[] = [];
    let text = "";
    const flush = () => {
      const words = text.replace(/\s+/g, " ").trim();
      if (words) lines.push(`${"  ".repeat(depth)}${words}`);
      text = "";
    };
    // Neighbouring pieces of text (`{tone} {variant}`) are one run of words.
    for (const child of Children.toArray(input)) {
      if (typeof child === "string" || typeof child === "number") text += String(child);
      else if (isValidElement(child)) {
        flush();
        lines.push(...element(child, depth));
      }
    }
    flush();
    return lines;
  };

  const element = (input: ReactElement, depth: number): string[] => {
    const props = input.props as Record<string, unknown>;
    if (input.type === Fragment) return children(props.children as ReactNode, depth);
    const name = nameOf(input.type);
    if (!name) throw new Unwritable();
    const dom = typeof input.type === "string";
    // A plain box that only lays its children out says nothing about the component: write the children.
    if (dom && ["div", "span", "section"].includes(name)) return children(props.children as ReactNode, depth);
    if (!dom) {
      if (!known.has(name)) throw new Unwritable();
      out.components.add(name);
    }
    const attributes: string[] = [];
    for (const [prop, each] of Object.entries(props)) {
      if (prop === "children" || prop === "key" || prop === "ref" || prop.startsWith("data-")) continue;
      if (dom && (prop === "style" || prop === "className")) continue;
      // A test spy (`onClick: fn()`) is not part of the example.
      if (typeof each === "function" && (each as { spy?: boolean }).spy) continue;
      if (each === true) attributes.push(prop);
      else {
        const written = value(prop, each, depth);
        if (written !== null) attributes.push(`${prop}=${written}`);
      }
    }
    const pad = "  ".repeat(depth);
    const inner = children(props.children as ReactNode, depth + 1);
    const open = [name, ...attributes].join(" ");
    const long = pad.length + open.length > 96;
    const head = long
      ? [`${pad}<${name}`, ...attributes.map((each) => `${pad}  ${each}`)]
      : [`${pad}<${open}`];
    const last = head.length - 1;
    if (!inner.length) {
      if (long) return [...head, `${pad}/>`];
      head[last] += " />";
      return head;
    }
    // Short text stays on the line: <Button>Save</Button>.
    const only = inner.length === 1 ? (inner[0] as string).trim() : "";
    if (!long && only && !only.startsWith("<") && pad.length + open.length + only.length < 92) {
      head[last] += `>${only}</${name}>`;
      return head;
    }
    if (long) head.push(`${pad}>`);
    else head[last] += ">";
    return [...head, ...inner, `${pad}</${name}>`];
  };

  try {
    out.lines = children(node, 0);
  } catch (error) {
    if (error instanceof Unwritable) return null;
    throw error;
  }
  if (!out.components.size) return null;
  const imports = [`import { ${[...out.components].sort().join(", ")} } from "${pkg}";`];
  if (out.icons.size) imports.push(`import { ${[...out.icons].sort().join(", ")} } from "${pkg}/icons";`);
  return [...imports, "", ...out.lines].join("\n");
}

/** Colour for code written by `writeJsx`: its grammar is small enough to mark by pattern. */
export function colourJsx(code: string): [string, string?][][] {
  const pattern =
    /("(?:[^"\\]|\\.)*")|(\b(?:import|from|new|true|false)\b)|(<\/?)([A-Za-z][\w.]*)|([a-zA-Z-]+)(?==)|(\b\d+(?:\.\d+)?\b)/g;
  return code.split("\n").map((line) => {
    const tokens: [string, string?][] = [];
    let at = 0;
    for (const match of line.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (index > at) tokens.push([line.slice(at, index)]);
      if (match[1]) tokens.push([match[1], "string"]);
      else if (match[2]) tokens.push([match[2], "keyword"]);
      else if (match[4]) tokens.push([match[3] as string, "punctuation"], [match[4], "tag"]);
      else if (match[5]) tokens.push([match[5], "attr-name"]);
      else if (match[6]) tokens.push([match[6], "number"]);
      at = index + match[0].length;
    }
    if (at < line.length) tokens.push([line.slice(at)]);
    return tokens;
  });
}
