export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_STORAGE_KEY = 'cynosure-docs-theme';

export function getThemeInitScript(): string {
  return `(() => {
    try {
      const stored = localStorage.getItem('${THEME_STORAGE_KEY}');
      const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const resolved = stored === 'system' || !stored ? sys : stored;
      document.documentElement.setAttribute('data-theme', resolved);
      if (stored) document.documentElement.setAttribute('data-theme-choice', stored);
      document.documentElement.style.colorScheme = resolved === 'light' ? 'light' : 'dark';
    } catch (_) {}
  })();`;
}
