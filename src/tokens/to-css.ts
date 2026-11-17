import type { ColorTokens, Theme } from "./schema.js";

/** Tokens live on the document root and shadow hosts only, so nested theme wrappers inherit from their ancestors. */
export const DEFAULT_SELECTOR = ":where(:root,:host)";

/** `ringColor` → `ring-color`, `size3xl` → `size-3xl` (a number after a letter starts a word, as in `--cy-font-size-3xl`). */
const kebab = (s: string) =>
  s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/([a-z])(\d)/g, "$1-$2");
const MS = new Set(["motion-fast", "motion-base", "motion-slow"]);
const UNITLESS = /^(scale|radius-factor|radius-segment|font-weight-|font-line-height|z-)/;

function flatten(obj: object, prefix: string, out: [string, string][]): [string, string][] {
  for (const [k, v] of Object.entries(obj)) {
    const name = prefix ? `${prefix}-${kebab(k)}` : kebab(k);
    if (v && typeof v === "object") flatten(v, name, out);
    else if (typeof v === "number")
      out.push([name, MS.has(name) ? `${v}ms` : UNITLESS.test(name) ? `${v}` : `${v}px`]);
    else out.push([name, String(v)]);
  }
  return out;
}

const decl = (pairs: [string, string][]) => pairs.map(([k, v]) => `--cy-${k}:${v}`).join(";");

const pair = (name: string, x: string, y: string): [string, string] => [
  `color-${name}`,
  x === y ? x : `light-dark(${x},${y})`,
];

/** One property per colour; the series list becomes `--cy-color-series-1` to `-8`. */
function colorPairs(a: ColorTokens, b: ColorTokens): [string, string][] {
  return (Object.keys(a) as (keyof ColorTokens)[]).flatMap((k) => {
    const x = a[k];
    const y = b[k];
    return Array.isArray(x)
      ? x.map((c, i) => pair(`series-${i + 1}`, c, (y as string[])[i] as string))
      : [pair(kebab(k), x, y as string)];
  });
}

/**
 * The theme as custom-property pairs (`--cy-*` → value), for applying on an element.
 * `contrast: true` swaps in the high-contrast palettes.
 */
export function themeProperties(theme: Theme, options: { contrast?: boolean } = {}): Record<string, string> {
  const [a, b] = options.contrast
    ? [theme.palettes["light-contrast"], theme.palettes["dark-contrast"]]
    : [theme.palettes.light, theme.palettes.dark];
  const pairs: [string, string][] = [
    ...flatten(theme.global, "", []),
    ...colorPairs(a, b),
    ...Object.entries(theme.components).flatMap(([c, t]) =>
      Object.entries(t).map(([k, v]) => [`${kebab(c)}-${kebab(k)}`, v] as [string, string]),
    ),
  ];
  return Object.fromEntries(pairs.map(([k, v]) => [`--cy-${k}`, v]));
}

/** Splits a selector list at its top-level commas (not those inside `:is(…)` or `:host(…)`). */
function splitList(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0) {
      parts.push(selector.slice(start, i).trim());
      start = i + 1;
    }
  }
  return [...parts, selector.slice(start).trim()];
}

const HOST = /^:host(?:\((.*)\))?$/;

/**
 * Qualifies a selector with an attribute condition, as a list of selectors. A shadow host only matches as `:host(…)`
 * (`:host[x]` never matches), so `:host` parts are qualified inside it; other lists are wrapped in `:is()` so the
 * condition applies to every selector in them.
 */
function scope(selector: string): (attr: string) => string[] {
  const parts = splitList(selector);
  if (!parts.some((p) => HOST.test(p))) {
    const host = parts.length > 1 ? `:is(${selector})` : selector;
    return (attr) => [`${host}${attr}`];
  }
  return (attr) =>
    parts.map((p) => (HOST.test(p) ? `:host(${HOST.exec(p)?.[1] ?? ""}${attr})` : `${p}${attr}`));
}

/**
 * Serialises a theme to CSS. The base block holds global, component and light/dark colour tokens
 * (via light-dark()); modes switch through `color-scheme`, contrast through an override block.
 */
export function themeToCss(theme: Theme, selector: string = DEFAULT_SELECTOR): string {
  const { light, dark } = theme.palettes;
  const base = [
    ...flatten(theme.global, "", []),
    ...colorPairs(light, dark),
    ...Object.entries(theme.components).flatMap(([c, t]) =>
      Object.entries(t).map(([k, v]) => [`${kebab(c)}-${kebab(k)}`, v] as [string, string]),
    ),
  ];
  const contrast = decl(colorPairs(theme.palettes["light-contrast"], theme.palettes["dark-contrast"]));
  const normal = decl(colorPairs(light, dark));
  const isDefault = selector === DEFAULT_SELECTOR;
  const scoped = scope(selector);
  // On an OS set to more contrast, a wrapper with contrast="normal" (and no theme of its own) puts the normal colours
  // back over the contrast ones it inherits. It comes after the contrast rule, so it wins at equal specificity.
  const followsOs = [...scoped(":not([data-cy-contrast])"), ...scoped('[data-cy-contrast="system"]')];
  const undo = isDefault
    ? `:where([data-cy-contrast="normal"]){${normal}}`
    : `${followsOs.map((s) => `${s} [data-cy-contrast="normal"]`).join(",")}{${normal}}`;
  const rule = (attr: string) => (isDefault ? `:where(${attr})` : scoped(attr).join(","));
  return [
    `${selector}{${decl(base)}}`,
    `${rule('[data-cy-mode="light"]')}{color-scheme:light}`,
    `${rule('[data-cy-mode="dark"]')}{color-scheme:dark}`,
    `${rule('[data-cy-mode="system"]')}{color-scheme:light dark}`,
    `@media (prefers-contrast:more){${isDefault ? ':where(:root:not([data-cy-contrast]),:host,[data-cy-contrast="system"])' : followsOs.join(",")}{${contrast}}${undo}}`,
    `${rule('[data-cy-contrast="more"]')}{${contrast}}`,
  ].join("\n");
}
