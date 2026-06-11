// Side-effect imports of the design tokens. These are the `:root{ --cynosure-* }`
// custom-property definitions every component reads via `var(--cynosure-*)`.
// Unlike per-component CSS (which each component's JS auto-imports), the tokens
// are global and must be loaded exactly once — so we attach them to the provider
// that every app already mounts. They're static imports, so the consumer's
// bundler extracts them into a real <head> stylesheet at build time (no FOUC,
// SSR-safe). Apps no longer need a manual `import '.../all.css'`. Provider-less
// or non-React consumers can still import the standalone CSS exports directly.
import '@arshad-shah/cynosure-tokens/css';
import '@arshad-shah/cynosure-tokens/css/dark';
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

// Don't pull in `@types/node` just to read NODE_ENV — widen `process` locally
// and guard with a `typeof` check so builds work outside Node.
declare const process: { env?: { NODE_ENV?: string } } | undefined;
const isDev = (): boolean => {
  try {
    return typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';
  } catch {
    return false;
  }
};

// Fire the "tokens not detected" dev warning at most once per session.
let tokensWarned = false;

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
  customThemes,
  attribute = 'data-theme',
  storage = 'localStorage',
  storageKey = 'cynosure-theme',
  disableTransitionOnChange = false,
  enableSystem = true,
  nonce,
  children,
}: ThemeProviderProps) {
  const adapterRef = useRef<StorageAdapter>(resolveStorage(storage));

  // Custom themes (from `defineTheme`) extend the allowed set and contribute
  // their own colour scheme. Names are appended so `setTheme('<name>')` and
  // persistence validate against them.
  const allThemes = useMemo<readonly string[]>(() => {
    if (!customThemes?.length) return themes;
    const extra = customThemes.map((t) => t.name).filter((n) => !themes.includes(n));
    return extra.length ? [...themes, ...extra] : themes;
  }, [themes, customThemes]);

  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    const stored = adapterRef.current.get(storageKey);
    if (stored && isAllowed(stored, allThemes, enableSystem)) return stored;
    return defaultTheme;
  });

  const [systemScheme, setSystemScheme] = useState<ColorScheme>(() => readSystemColorScheme());

  const resolvedTheme = useMemo(() => {
    if (theme === SYSTEM) return systemScheme;
    return theme;
  }, [theme, systemScheme]);

  const colorScheme: ColorScheme = useMemo(() => {
    if (isColorScheme(resolvedTheme)) return resolvedTheme;
    // A custom theme declares its own scheme via `defineTheme(..., { colorScheme })`.
    const custom = customThemes?.find((t) => t.name === resolvedTheme);
    if (custom) return custom.colorScheme;
    // Otherwise infer from the name (built-in `terminal`, or a `*dark*` variant).
    return /dark|terminal|midnight|night/i.test(resolvedTheme) ? 'dark' : 'light';
  }, [resolvedTheme, customThemes]);

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

  // Dev-only safety net: the tokens are imported above, but a misconfigured
  // bundler (one that drops side-effect CSS imports, or doesn't process CSS at
  // all) could strip them, leaving every `var(--cynosure-*)` empty. Warn once if
  // the canvas token isn't resolvable after mount. Stripped in production.
  useEffect(() => {
    if (tokensWarned || !isDev() || typeof window === 'undefined') return;
    const token = getComputedStyle(document.documentElement)
      .getPropertyValue('--cynosure-color-background-canvas')
      .trim();
    if (!token) {
      tokensWarned = true;
      console.warn(
        '[cynosure] Design tokens not detected. The CynosureProvider loads them ' +
          'automatically, but your bundler may have dropped the CSS import — import ' +
          "'@arshad-shah/cynosure-tokens/css' (and '/css/dark') manually as a fallback.",
      );
    }
  }, []);

  const setTheme = useCallback(
    (next: string) => {
      const target = isAllowed(next, allThemes, enableSystem) ? next : defaultTheme;
      adapterRef.current.set(storageKey, target);
      setThemeState(target);
    },
    [allThemes, enableSystem, defaultTheme, storageKey],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      colorScheme,
      setTheme,
      themes: allThemes,
    }),
    [theme, resolvedTheme, colorScheme, setTheme, allThemes],
  );

  return (
    <ThemeContext.Provider value={value}>
      {/* Inject each custom theme's CSS as a server-rendered <style> so the
          theme is styled on first paint (no FOUC) and during SSR. */}
      {customThemes?.map((t) => (
        <style
          key={t.name}
          data-cynosure-theme={t.name}
          // The CSS is generated by `defineTheme` from a typed token object —
          // not arbitrary user HTML.
          // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized design tokens, not user input
          dangerouslySetInnerHTML={{ __html: t.css }}
        />
      ))}
      {children}
    </ThemeContext.Provider>
  );
}

export const ThemeContextInternal = ThemeContext;

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a <ThemeProvider>.');
  }
  return ctx;
}
