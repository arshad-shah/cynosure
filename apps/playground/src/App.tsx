import { VERSION } from '@lumen/react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function App() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: 'var(--lumen-color-background-canvas)',
        color: 'var(--lumen-color-foreground-default)',
        fontFamily: 'var(--lumen-font-family-sans)',
      }}
    >
      <h1>Lumen {VERSION}</h1>
      <p style={{ color: 'var(--lumen-color-foreground-muted)' }}>
        Token pipeline smoke test. Flip the toggle to swap <code>data-theme</code>.
      </p>
      <button
        type="button"
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        style={{
          background: 'var(--lumen-color-accent-solid)',
          color: 'var(--lumen-color-accent-on-solid)',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--lumen-radius-component-md)',
          cursor: 'pointer',
        }}
      >
        Toggle theme (now: {theme})
      </button>
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--lumen-color-background-surface)',
          border: '1px solid var(--lumen-color-border-default)',
          borderRadius: 'var(--lumen-radius-component-lg)',
          boxShadow: 'var(--lumen-shadow-sm)',
        }}
      >
        Surface card.
      </div>
    </div>
  );
}
