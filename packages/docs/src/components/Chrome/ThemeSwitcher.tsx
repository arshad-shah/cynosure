import { Select } from '@arshad-shah/cynosure-react';
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
    <Select
      aria-label="Theme"
      value={theme}
      onValueChange={(v) => apply(v as Theme)}
      items={THEMES.map((t) => ({ value: t, label: t }))}
      size="sm"
    />
  );
}
