import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect.js';
import { resolveStorage } from './storage.js';
import type {
  ColorScheme,
  StorageAdapter,
  ThemeContextValue,
  ThemeProviderProps,
} from './types.js';

const ThemeContext = createContext<ThemeContextValue | null>(null);

const SYSTEM = 'system';
const DEFAULT_THEMES = ['light', 'dark'] as const;
const SYSTEM_QUERY = '(prefers-color-scheme: dark)';

const isColorScheme = (value: string): value is ColorScheme =>
  value === 'light' || value === 'dark';

const readSystemColorScheme = (): ColorScheme => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia(SYSTEM_QUERY).matches ? 'dark' : 'light';
};

const isAllowed = (theme: string, themes: readonly string[], enableSystem: boolean): boolean => {
  if (enableSystem && theme === SYSTEM) return true;
  return themes.includes(theme);
};

const flushTransitionDisable = (nonce: string | undefined) => {
  if (typeof window === 'undefined') return;
  const style = document.createElement('style');
  if (nonce) style.setAttribute('nonce', nonce);
  style.appendChild(document.createTextNode('*,*::before,*::after{transition:none!important}'));
  document.head.appendChild(style);
  // Force a synchronous reflow so the rule applies before the attribute swap.
  void window.getComputedStyle(document.body).opacity;
  window.requestAnimationFrame(() => {
    style.remove();
  });
};

const applyTheme = (attribute: `data-${string}`, resolved: string, colorScheme: ColorScheme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute(attribute, resolved);
  root.style.colorScheme = colorScheme;
};

export function ThemeProvider({
  defaultTheme = SYSTEM,
  themes = DEFAULT_THEMES,
  attribute = 'data-theme',
  storage = 'localStorage',
  storageKey = 'cynosure-theme',
  disableTransitionOnChange = false,
  enableSystem = true,
  nonce,
  children,
}: ThemeProviderProps) {
  const adapterRef = useRef<StorageAdapter>(resolveStorage(storage));

  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    const stored = adapterRef.current.get(storageKey);
    if (stored && isAllowed(stored, themes, enableSystem)) return stored;
    return defaultTheme;
  });

  const [systemScheme, setSystemScheme] = useState<ColorScheme>(() => readSystemColorScheme());

  const resolvedTheme = useMemo(() => {
    if (theme === SYSTEM) return systemScheme;
    return theme;
  }, [theme, systemScheme]);

  const colorScheme: ColorScheme = useMemo(() => {
    if (isColorScheme(resolvedTheme)) return resolvedTheme;
    // Custom themes default to dark colour-scheme if their name contains "dark"
    // or "terminal", otherwise light. Consumers can override via CSS.
    return /dark|terminal|midnight|night/i.test(resolvedTheme) ? 'dark' : 'light';
  }, [resolvedTheme]);

  // Listen for system colour-scheme changes when relevant.
  useEffect(() => {
    if (!enableSystem) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(SYSTEM_QUERY);
    const handler = (event: MediaQueryListEvent) => {
      setSystemScheme(event.matches ? 'dark' : 'light');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [enableSystem]);

  // Sync the DOM whenever the resolved theme changes.
  useIsomorphicLayoutEffect(() => {
    if (disableTransitionOnChange) flushTransitionDisable(nonce);
    applyTheme(attribute, resolvedTheme, colorScheme);
  }, [attribute, resolvedTheme, colorScheme, disableTransitionOnChange, nonce]);

  const setTheme = useCallback(
    (next: string) => {
      const target = isAllowed(next, themes, enableSystem) ? next : defaultTheme;
      adapterRef.current.set(storageKey, target);
      setThemeState(target);
    },
    [themes, enableSystem, defaultTheme, storageKey],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      colorScheme,
      setTheme,
      themes,
    }),
    [theme, resolvedTheme, colorScheme, setTheme, themes],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const ThemeContextInternal = ThemeContext;

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a <ThemeProvider>.');
  }
  return ctx;
}
