import type { ReactNode } from 'react';

export type ColorScheme = 'light' | 'dark';

export type Direction = 'ltr' | 'rtl';

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export interface ThemeProviderProps {
  /** The default theme name when no persisted preference exists. */
  defaultTheme?: string;
  /** Allowed theme names. If provided, an unknown value falls back to defaultTheme. */
  themes?: readonly string[];
  /** HTML attribute used for the theme selector. Defaults to "data-theme". */
  attribute?: `data-${string}`;
  /** Storage strategy. `null` disables persistence entirely. */
  storage?: 'localStorage' | 'sessionStorage' | StorageAdapter | null;
  /** Key under which to persist. */
  storageKey?: string;
  /** When true, briefly disables transitions during theme change to avoid flash. */
  disableTransitionOnChange?: boolean;
  /** Whether to respect prefers-color-scheme for the "system" value. Default true. */
  enableSystem?: boolean;
  /** CSP nonce used on the injected inline transition-disable style element. */
  nonce?: string;
  children: ReactNode;
}

export interface ThemeContextValue {
  /** The currently chosen theme name (may be "system"). */
  theme: string;
  /** Resolved theme — if theme is "system", this is "light" or "dark". */
  resolvedTheme: string;
  /** The underlying colour scheme ("light" | "dark"), useful for mode-aware logic. */
  colorScheme: ColorScheme;
  /** Change the theme. */
  setTheme: (theme: string) => void;
  /** The list of allowed themes, as configured. */
  themes: readonly string[];
}

export interface DirectionProviderProps {
  /** The direction value. Defaults to "ltr". */
  dir?: Direction;
  /**
   * When true (default), syncs `<html dir>` so the entire document inherits.
   * Set to false to scope direction to a wrapping `<div dir>` only.
   */
  scope?: 'document' | 'subtree';
  children: ReactNode;
}

export interface DirectionContextValue {
  dir: Direction;
}

export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;
