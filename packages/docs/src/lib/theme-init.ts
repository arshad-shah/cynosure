export const THEMES = ['light', 'dark', 'terminal', 'high-contrast'] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_STORAGE_KEY = 'cynosure-docs-theme';

export function getThemeInitScript(): string {
  return `(() => {
    try {
      const stored = localStorage.getItem('${THEME_STORAGE_KEY}');
      const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const theme = stored || sys;
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    } catch (_) {}
  })();`;
}
