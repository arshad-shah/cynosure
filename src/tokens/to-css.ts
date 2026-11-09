import type { ColorTokens, Theme } from "./schema.js";

/** Tokens live on the document root and shadow hosts only, so nested theme wrappers inherit from their ancestors. */
export const DEFAULT_SELECTOR = ":where(:root,:host)";

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
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

function colorPairs(a: ColorTokens, b: ColorTokens): [string, string][] {
  return (Object.keys(a) as (keyof ColorTokens)[]).map((k) => [
    `color-${kebab(k)}`,
    a[k] === b[k] ? a[k] : `light-dark(${a[k]},${b[k]})`,
  ]);
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
      Object.entries(t).map(([k, v]) => [`${c}-${kebab(k)}`, v] as [string, string]),
    ),
  ];
  return Object.fromEntries(pairs.map(([k, v]) => [`--cy-${k}`, v]));
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
      Object.entries(t).map(([k, v]) => [`${c}-${kebab(k)}`, v] as [string, string]),
    ),
  ];
  const contrast = decl(colorPairs(theme.palettes["light-contrast"], theme.palettes["dark-contrast"]));
  // Selector lists are wrapped in :is() so attribute qualifiers apply to every selector in the list.
  const host = selector.includes(",") ? `:is(${selector})` : selector;
  const scoped = (attr: string) => (selector === DEFAULT_SELECTOR ? `:where(${attr})` : `${host}${attr}`);
  const isDefault = selector === DEFAULT_SELECTOR;
  return [
    `${selector}{${decl(base)}}`,
    `${scoped('[data-cy-mode="light"]')}{color-scheme:light}`,
    `${scoped('[data-cy-mode="dark"]')}{color-scheme:dark}`,
    `${scoped('[data-cy-mode="system"]')}{color-scheme:light dark}`,
    `@media (prefers-contrast:more){${isDefault ? ':where(:root:not([data-cy-contrast]),:host,[data-cy-contrast="system"])' : scoped('[data-cy-contrast="system"]')}{${contrast}}}`,
    `${scoped('[data-cy-contrast="more"]')}{${contrast}}`,
  ].join("\n");
}
