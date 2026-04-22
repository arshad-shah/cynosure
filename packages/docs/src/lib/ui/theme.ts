import { THEMES, THEME_STORAGE_KEY, type Theme } from '../theme-init.js';

export { THEMES, THEME_STORAGE_KEY, type Theme };

const THEME_CHANGED_EVENT = 'cynosure:theme-changed';

function isTheme(value: string | null): value is Theme {
  return value !== null && (THEMES as readonly string[]).includes(value);
}

export function getStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-theme');
  return isTheme(attr) ? attr : 'light';
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
  window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: { theme } }));
}

export function onThemeChange(cb: (theme: Theme) => void): () => void {
  const handler = (event: Event): void => {
    const detail = (event as CustomEvent<{ theme: Theme }>).detail;
    if (detail && isTheme(detail.theme)) {
      cb(detail.theme);
    }
  };
  window.addEventListener(THEME_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener(THEME_CHANGED_EVENT, handler);
  };
}
