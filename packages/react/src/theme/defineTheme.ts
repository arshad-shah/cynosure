import { toCssVarName } from '../styles/tokenPath.js';
import type { Vars } from '../styles/vars.css.js';
import type { ColorScheme } from './types.js';

/**
 * Deeply-optional view of a type — every nested key becomes optional so a theme
 * can override just the slots it cares about and inherit the rest from `:root`.
 */
type DeepPartial<T> = T extends string | number ? T : { [K in keyof T]?: DeepPartial<T[K]> };

/**
 * The typed token surface a theme may override. Mirrors the design-token tree
 * ({@link Vars}) exactly — `color`, `radius`, `shadow`, `space`, `duration`, … —
 * so your editor autocompletes every overridable slot and a typo is a *compile
 * error*, not a silently-ignored CSS property.
 *
 * Each leaf takes a CSS value string, e.g.
 * `{ color: { accent: { solid: '#0ea5e9' } } }`.
 */
export type ThemeTokens = DeepPartial<Vars>;

/** Options for {@link defineTheme}. */
export interface DefineThemeOptions {
  /**
   * The base colour scheme this theme reads as — sets the root `color-scheme`
   * (so native form controls, scrollbars, and `prefers-color-scheme`-derived
   * UA styling match) when the theme is active. Default `'light'`.
   */
  colorScheme?: ColorScheme;
}

/**
 * A theme produced by {@link defineTheme}: a name, its colour scheme, and the
 * generated `[data-theme="…"]{ … }` CSS. Pass it to `CynosureProvider` /
 * `ThemeProvider` via `customThemes` (the provider renders the CSS as an
 * SSR-safe `<style>` and registers the name), or write `.css` to a file at
 * build time if you prefer.
 */
export interface CynosureTheme {
  /** The theme name — the value set on `data-theme` to activate it. */
  name: string;
  /** Base colour scheme, used to set the root `color-scheme`. */
  colorScheme: ColorScheme;
  /** Generated CSS: `[data-theme="name"]{ --cynosure-*: …; }`. */
  css: string;
}

const serialize = (tokens: ThemeTokens): string => {
  const decls: string[] = [];
  const visit = (node: unknown, path: string[]): void => {
    if (node == null) return;
    if (typeof node === 'string' || typeof node === 'number') {
      decls.push(`${toCssVarName(path)}:${node}`);
      return;
    }
    if (typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) visit(value, [...path, key]);
    }
  };
  visit(tokens, []);
  return decls.join(';');
};

/**
 * Author a Cynosure theme from a **typed** token object instead of hand-written
 * CSS. You override only the slots that differ from the base `:root` tokens;
 * everything else cascades through, so a usable theme is often just a handful of
 * colours.
 *
 * @example
 * ```tsx
 * import { CynosureProvider, defineTheme } from '@arshad-shah/cynosure-react';
 *
 * const ocean = defineTheme(
 *   'ocean',
 *   {
 *     color: {
 *       accent: { solid: '#0ea5e9', solidHover: '#0284c7', onSolid: '#fff' },
 *       background: { canvas: '#0b1220', surface: '#0f1b2d' },
 *       foreground: { default: '#e2e8f0', muted: '#94a3b8' },
 *       border: { default: '#1e293b' },
 *     },
 *     radius: { component: { md: '10px' } },
 *   },
 *   { colorScheme: 'dark' },
 * );
 *
 * <CynosureProvider theme={{ customThemes: [ocean], defaultTheme: 'ocean' }}>
 *   <App />
 * </CynosureProvider>;
 * ```
 *
 * The result is fully data-driven: the same object can be serialised to a `.css`
 * file at build time (`theme.css`) if you'd rather not inject at runtime.
 *
 * @param name    The theme name (the `data-theme` value used to activate it).
 * @param tokens  Typed token overrides — autocompleted, typo-checked.
 * @param options Optional metadata (e.g. base `colorScheme`).
 */
export function defineTheme(
  name: string,
  tokens: ThemeTokens,
  options: DefineThemeOptions = {},
): CynosureTheme {
  // The name lands inside a CSS attribute selector; strip characters that would
  // let it break out of the `[data-theme="…"]{ … }` selector or rule block.
  const safeName = name.replace(/["\\\]{}]/g, '');
  const body = serialize(tokens);
  return {
    name,
    colorScheme: options.colorScheme ?? 'light',
    css: `[data-theme="${safeName}"]{${body}}`,
  };
}
