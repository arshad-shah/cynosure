import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const src = fileURLToPath(new URL("../../src/", import.meta.url));
/** As `themeToCss` names a component token: `sizeSm` → `size-sm`, `size3xl` → `size-3xl`. */
const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([a-z])(\d)/g, "$1-$2")
    .toLowerCase();

/** Each component folder with a stylesheet: the `--cy-<component>-*` tokens it reads, and the tokens it declares. */
const folders = ["components", "foundations"].flatMap((group) =>
  readdirSync(`${src}${group}`, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dir = `${src}${group}/${d.name}/`;
      const files = readdirSync(dir);
      const css = files.filter((f) => f.endsWith(".css")).map((f) => readFileSync(dir + f, "utf8"));
      const tsx = files.includes(`${d.name}.tsx`) ? readFileSync(`${dir}${d.name}.tsx`, "utf8") : "";
      return { name: d.name, css: css.join("\n"), tsx };
    }),
);

test("every component token a stylesheet reads is declared in the component's Tokens type", () => {
  const missing: string[] = [];
  for (const { name, css, tsx } of folders) {
    const prefix = `--cy-${kebab(name)}-`;
    const read = new Set([...css.matchAll(/var\((--cy-[a-z0-9-]+)/g)].map((m) => m[1] as string));
    const own = [...read].filter((t) => t.startsWith(prefix));
    if (own.length === 0) continue;
    const body = tsx.match(new RegExp(`export interface ${name}Tokens \\{([\\s\\S]*?)\\n\\}`))?.[1] ?? "";
    const declared = new Set(
      [...body.matchAll(/^\s+"?([a-zA-Z0-9-]+)"?\??:/gm)].map((m) => kebab(m[1] as string)),
    );
    for (const token of own) if (!declared.has(token.slice(prefix.length))) missing.push(`${name}: ${token}`);
  }
  expect(missing).toEqual([]);
});

test("a component token named with a number reaches the variable its stylesheet reads", async () => {
  const { createTheme, themeToCss } = await import("../../src/tokens/index.js");
  const css = themeToCss(createTheme({ components: { text: { size3xl: "40px" } } }));
  expect(css).toContain("--cy-text-size-3xl:40px");
  const text = readFileSync(`${src}components/Text/text.css`, "utf8");
  expect(text).toContain("var(--cy-text-size-3xl");
});
