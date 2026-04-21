import { useEffect, useState } from 'react';
import { THEMES, THEME_STORAGE_KEY, type Theme } from '../../lib/theme-init';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const t = (document.documentElement.getAttribute('data-theme') as Theme | null) ?? 'light';
    setTheme(t);
  }, []);

  const apply = (t: Theme) => {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t === 'light' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, t);
  };

  return (
    <label data-theme-switcher>
      <span className="visually-hidden">Theme</span>
      <select value={theme} onChange={(e) => apply(e.target.value as Theme)}>
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
