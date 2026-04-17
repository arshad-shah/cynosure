import {
  DirectionProvider,
  ThemeProvider,
  Toaster,
  TooltipProvider,
  VERSION,
  useTheme,
} from '@lumen/react';
import { useState } from 'react';
import { DataDisplaySection } from './sections/dataDisplay';
import { FeedbackSection } from './sections/feedback';
import { FormsSection } from './sections/forms';
import { NavigationSection } from './sections/navigation';
import { OverlaySection } from './sections/overlay';
import { PrimitivesSection } from './sections/primitives';
import { TypographySection } from './sections/typography';
import './showcase.css';

const THEMES = ['system', 'light', 'dark', 'terminal', 'high-contrast'] as const;

type SectionKey =
  | 'primitives'
  | 'typography'
  | 'forms'
  | 'overlay'
  | 'navigation'
  | 'dataDisplay'
  | 'feedback';

const SECTIONS: { key: SectionKey; label: string; render: () => React.ReactNode }[] = [
  { key: 'primitives', label: 'Primitives', render: () => <PrimitivesSection /> },
  { key: 'typography', label: 'Typography', render: () => <TypographySection /> },
  { key: 'forms', label: 'Forms', render: () => <FormsSection /> },
  { key: 'overlay', label: 'Overlays', render: () => <OverlaySection /> },
  { key: 'navigation', label: 'Navigation', render: () => <NavigationSection /> },
  { key: 'dataDisplay', label: 'Data display', render: () => <DataDisplaySection /> },
  { key: 'feedback', label: 'Feedback', render: () => <FeedbackSection /> },
];

function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme, colorScheme } = useTheme();
  return (
    <label style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
      <span>Theme</span>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        {THEMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <small style={{ color: 'var(--lumen-color-foreground-muted)' }}>
        {resolvedTheme} · {colorScheme}
      </small>
    </label>
  );
}

function Shell() {
  const [active, setActive] = useState<SectionKey>('primitives');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const section = SECTIONS.find((s) => s.key === active);

  return (
    <DirectionProvider dir={dir}>
      <div className="showcase-shell">
        <nav className="showcase-nav" aria-label="Showcase sections">
          <strong style={{ padding: '0.25rem 0.75rem 0.5rem' }}>Lumen {VERSION}</strong>
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-current={active === s.key ? 'page' : undefined}
              onClick={() => setActive(s.key)}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <main className="showcase-main">
          <div className="showcase-topbar">
            <ThemeSwitcher />
            <label style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>Direction</span>
              <select value={dir} onChange={(e) => setDir(e.target.value as 'ltr' | 'rtl')}>
                <option value="ltr">ltr</option>
                <option value="rtl">rtl</option>
              </select>
            </label>
          </div>
          {section?.render()}
        </main>
      </div>
      <Toaster />
    </DirectionProvider>
  );
}

export function App() {
  return (
    <ThemeProvider
      defaultTheme="system"
      themes={['system', 'light', 'dark', 'terminal', 'high-contrast']}
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Shell />
      </TooltipProvider>
    </ThemeProvider>
  );
}
