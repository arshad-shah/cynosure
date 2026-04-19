import { useEffect, useState } from 'react';

export const DEFAULT_LIGHT_THEME = 'github-light-default';
export const DEFAULT_DARK_THEME = 'github-dark-default';

export interface DualTheme {
  light: string;
  dark: string;
}

/** Single string (one theme for both schemes) or `{ light, dark }` dual theme. */
export type CodeTheme = string | DualTheme;

interface ShikiHighlighter {
  codeToHtml: (
    code: string,
    opts:
      | { lang: string; theme: string }
      | { lang: string; themes: DualTheme; defaultColor: false },
  ) => string;
}

/**
 * Module-level cache. Shiki docs explicitly say the highlighter should be a
 * singleton — one per render triggers the "[Shiki] N instances have been
 * created" warning and hammers startup cost. Cache keyed by `(lang, themes)`
 * so multi-language / multi-theme docs still pay only once per combo.
 */
const highlighterCache = new Map<string, Promise<ShikiHighlighter>>();

function themeKey(theme: CodeTheme): string {
  return typeof theme === 'string' ? theme : `${theme.light}::${theme.dark}`;
}

function themeList(theme: CodeTheme): string[] {
  return typeof theme === 'string' ? [theme] : [theme.light, theme.dark];
}

async function getHighlighter(lang: string, theme: CodeTheme): Promise<ShikiHighlighter> {
  const key = `${lang}::${themeKey(theme)}`;
  const cached = highlighterCache.get(key);
  if (cached) return cached;
  const promise = (async () => {
    const shiki = (await import('shiki')) as {
      createHighlighter: (opts: {
        langs: string[];
        themes: string[];
      }) => Promise<ShikiHighlighter>;
    };
    return shiki.createHighlighter({ langs: [lang], themes: themeList(theme) });
  })();
  highlighterCache.set(key, promise);
  // Drop the entry on failure so a later call can retry.
  promise.catch(() => {
    highlighterCache.delete(key);
  });
  return promise;
}

/**
 * Highlight source into `<CodeBlock html=>`-ready HTML. Defaults to a
 * dual-theme output so the same HTML works in light and dark — the active
 * theme is picked up via `data-theme` on the document root (Cynosure's
 * `ThemeProvider` pattern) *or* `prefers-color-scheme` as a fallback.
 *
 * Pass a single string to force one theme only.
 *
 * ```ts
 * // Dual (default) — flips with the Cynosure theme
 * const html = await highlightCode(src, 'tsx');
 *
 * // Single theme, forced
 * const html = await highlightCode(src, 'tsx', 'dracula');
 *
 * // Custom dual
 * const html = await highlightCode(src, 'tsx', { light: 'catppuccin-latte', dark: 'catppuccin-mocha' });
 * ```
 */
export async function highlightCode(
  source: string,
  lang: string,
  theme: CodeTheme = { light: DEFAULT_LIGHT_THEME, dark: DEFAULT_DARK_THEME },
): Promise<string> {
  const h = await getHighlighter(lang, theme);
  if (typeof theme === 'string') {
    return h.codeToHtml(source, { lang, theme });
  }
  // Dual-theme mode: Shiki emits `--shiki-light` / `--shiki-dark` CSS vars
  // inline on each token. The consumer CSS (in CodeBlock.css.ts) switches
  // them based on `[data-theme="dark"]` or `prefers-color-scheme: dark`.
  return h.codeToHtml(source, { lang, themes: theme, defaultColor: false });
}

export interface UseCodeHighlightResult {
  /** Rendered HTML once Shiki resolves; `null` while loading or on error. */
  html: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook wrapping `highlightCode`. Returns rendered HTML plus loading /
 * error state. Re-runs when `source`, `lang`, or `theme` changes — the
 * module-level highlighter cache means only the first call per combo pays
 * Shiki's init cost.
 */
export function useCodeHighlight(
  source: string,
  lang: string,
  options: { theme?: CodeTheme; enabled?: boolean } = {},
): UseCodeHighlightResult {
  const theme = options.theme ?? { light: DEFAULT_LIGHT_THEME, dark: DEFAULT_DARK_THEME };
  const enabled = options.enabled !== false;

  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Extract primitive dep values so an inline `{ light, dark }` object
  // doesn't trigger infinite re-runs.
  const themeFingerprint = themeKey(theme);

  useEffect(() => {
    if (!enabled) {
      setHtml(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    highlightCode(source, lang, theme)
      .then((result) => {
        if (cancelled) return;
        setHtml(result);
        setLoading(false);
      })
      .catch((cause) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // theme is covered via themeFingerprint (primitive string).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, lang, themeFingerprint, enabled]);

  return { html, loading, error };
}

