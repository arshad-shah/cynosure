import type { CSSProperties } from 'react';
import { BREAKPOINTS, type Breakpoint, type Responsive } from './breakpoints.js';

/**
 * Normalise a raw prop (`T`, `{ base: T, md: T }`, or `undefined`) into a flat
 * `{ base?, sm?, md?, lg?, xl?, '2xl'? }` map.
 */
export const normaliseResponsive = <T>(
  value: Responsive<T> | undefined,
): Partial<Record<Breakpoint, T>> | undefined => {
  if (value === undefined) return undefined;
  if (value !== null && typeof value === 'object') {
    return value as Partial<Record<Breakpoint, T>>;
  }
  return { base: value as T };
};

/**
 * Emit a set of CSS custom properties covering every breakpoint the caller
 * provided.
 *
 * For each `[bp, value]` entry we write `--{varBase}-{bp}` onto the element's
 * inline `style`. The primitive's `.css.ts` base rule reads those variables in
 * cascading media queries (sm → md → lg → xl → 2xl) so only the declared
 * breakpoints take effect and any gaps inherit from the previous breakpoint.
 */
export const toResponsiveVars = <T>(
  value: Responsive<T> | undefined,
  varBase: string,
  transform?: (v: T, bp: Breakpoint) => string | undefined,
): CSSProperties | undefined => {
  const map = normaliseResponsive(value);
  if (!map) return undefined;
  const out: Record<string, string> = {};
  for (const bp of BREAKPOINTS) {
    const raw = map[bp];
    if (raw === undefined) continue;
    const rendered = transform ? transform(raw, bp) : String(raw);
    if (rendered === undefined) continue;
    out[`--${varBase}-${bp}`] = rendered;
  }
  return out as CSSProperties;
};

/**
 * Merge an arbitrary number of `React.CSSProperties` objects (including the
 * responsive-var dictionaries produced by `toResponsiveVars`). `undefined`
 * entries are ignored. Latest non-undefined values win.
 */
export const mergeStyles = (
  ...styles: Array<CSSProperties | undefined>
): CSSProperties | undefined => {
  const result: CSSProperties = {};
  let hasAny = false;
  for (const style of styles) {
    if (!style) continue;
    hasAny = true;
    Object.assign(result, style);
  }
  return hasAny ? result : undefined;
};
