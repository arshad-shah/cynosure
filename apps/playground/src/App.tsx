import { type ReactNode, useEffect, useState } from 'react';
import { ChartsPlayground } from './playgrounds/ChartsPlayground.js';
import { DataDisplayPlayground } from './playgrounds/DataDisplayPlayground.js';
import { FeedbackPlayground } from './playgrounds/FeedbackPlayground.js';
import { FormsPlayground } from './playgrounds/FormsPlayground.js';
import { OverlaysPlayground } from './playgrounds/OverlaysPlayground.js';
import { TypographyPlayground } from './playgrounds/TypographyPlayground.js';

interface PlaygroundEntry {
  id: string;
  label: string;
  description: string;
  render: () => ReactNode;
}

const PLAYGROUNDS: PlaygroundEntry[] = [
  {
    id: 'charts',
    label: 'Charts',
    description:
      'SwiftChart-powered chart wrappers. Resize the window to see the responsive Canvas reflow without a re-render.',
    render: () => <ChartsPlayground />,
  },
  {
    id: 'forms',
    label: 'Forms',
    description: 'Inputs, selects, sliders, and other interactive form primitives.',
    render: () => <FormsPlayground />,
  },
  {
    id: 'overlays',
    label: 'Overlays',
    description: 'Dialog, drawer, popover, dropdown, tooltip — every floating surface.',
    render: () => <OverlaysPlayground />,
  },
  {
    id: 'data-display',
    label: 'Data display',
    description: 'Cards, tables, badges, avatars, progress, and the rest of the static surfaces.',
    render: () => <DataDisplayPlayground />,
  },
  {
    id: 'feedback',
    label: 'Feedback',
    description: 'Alerts, banners, callouts, and toast notifications.',
    render: () => <FeedbackPlayground />,
  },
  {
    id: 'typography',
    label: 'Typography',
    description: 'Type ramp, headings, body sizes, and the inline text primitives.',
    render: () => <TypographyPlayground />,
  },
];

function useTheme(): [string, (next: string) => void] {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return [theme, setTheme];
}

export function App() {
  const initial =
    (typeof window !== 'undefined' && window.location.hash.replace('#', '')) || 'charts';
  const [active, setActive] = useState<string>(
    PLAYGROUNDS.some((p) => p.id === initial) ? initial : 'charts',
  );
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHash = () => {
      const next = window.location.hash.replace('#', '');
      if (PLAYGROUNDS.some((p) => p.id === next)) setActive(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const current = PLAYGROUNDS.find((p) => p.id === active) ?? PLAYGROUNDS[0]!;

  return (
    <div className="pg-shell">
      <header className="pg-header">
        <div className="pg-header-left">
          <span className="pg-header-mark" aria-hidden />
          <span>Cynosure · playground</span>
        </div>
        <div className="pg-header-actions">
          <button
            type="button"
            className="pg-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
      </header>

      <aside className="pg-sidebar">
        <nav className="pg-nav" aria-label="Playgrounds">
          {PLAYGROUNDS.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="pg-nav-item"
              data-active={p.id === active || undefined}
              onClick={() => setActive(p.id)}
            >
              {p.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="pg-main">
        <section className="pg-section">
          <header>
            <h1 className="pg-section-title">{current.label}</h1>
            <p className="pg-section-lede">{current.description}</p>
          </header>
          {current.render()}
        </section>
      </main>
    </div>
  );
}
