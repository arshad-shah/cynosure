import {
  DirectionProvider,
  ThemeProvider,
  VERSION,
  useDirection,
  useReducedMotion,
  useTheme,
} from '@lumen/react';
import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';

const THEMES = ['system', 'light', 'dark', 'terminal', 'high-contrast'] as const;

function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme, colorScheme } = useTheme();
  return (
    <label
      style={{
        display: 'inline-flex',
        gap: '0.5rem',
        alignItems: 'center',
        color: 'var(--lumen-color-foreground-default)',
      }}
    >
      <span>Theme</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
        style={{
          background: 'var(--lumen-color-background-surface)',
          color: 'var(--lumen-color-foreground-default)',
          border: '1px solid var(--lumen-color-border-default)',
          borderRadius: 'var(--lumen-radius-component-md)',
          padding: '0.25rem 0.5rem',
        }}
      >
        {THEMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <small style={{ color: 'var(--lumen-color-foreground-muted)' }}>
        resolved: {resolvedTheme} · scheme: {colorScheme}
      </small>
    </label>
  );
}

function DirectionSwitcher({
  dir,
  onChange,
}: {
  dir: 'ltr' | 'rtl';
  onChange: (dir: 'ltr' | 'rtl') => void;
}) {
  const ctxDir = useDirection();
  return (
    <label
      style={{
        display: 'inline-flex',
        gap: '0.5rem',
        alignItems: 'center',
        color: 'var(--lumen-color-foreground-default)',
      }}
    >
      <span>Direction</span>
      <select
        value={dir}
        onChange={(event) => onChange(event.target.value as 'ltr' | 'rtl')}
        style={{
          background: 'var(--lumen-color-background-surface)',
          color: 'var(--lumen-color-foreground-default)',
          border: '1px solid var(--lumen-color-border-default)',
          borderRadius: 'var(--lumen-radius-component-md)',
          padding: '0.25rem 0.5rem',
        }}
      >
        <option value="ltr">ltr</option>
        <option value="rtl">rtl</option>
      </select>
      <small style={{ color: 'var(--lumen-color-foreground-muted)' }}>context: {ctxDir}</small>
    </label>
  );
}

function RadixDirectionDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger
        style={{
          background: 'var(--lumen-color-accent-solid)',
          color: 'var(--lumen-color-accent-on-solid)',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--lumen-radius-component-md)',
          cursor: 'pointer',
        }}
      >
        Open Radix popover
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          style={{
            background: 'var(--lumen-color-background-raised)',
            color: 'var(--lumen-color-foreground-default)',
            border: '1px solid var(--lumen-color-border-default)',
            borderRadius: 'var(--lumen-radius-component-md)',
            boxShadow: 'var(--lumen-shadow-component-popover)',
            padding: '0.75rem 1rem',
          }}
        >
          Radix inherits the active <code>dir</code> from
          <br />
          Lumen's <code>DirectionProvider</code>.
          <Popover.Arrow style={{ fill: 'var(--lumen-color-background-raised)' }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ReducedMotionBanner() {
  const reduced = useReducedMotion();
  if (!reduced) return null;
  return (
    <div
      style={{
        marginTop: '0.5rem',
        padding: '0.5rem 0.75rem',
        background: 'var(--lumen-color-feedback-info-soft)',
        color: 'var(--lumen-color-feedback-info-foreground)',
        border: '1px solid var(--lumen-color-feedback-info-border)',
        borderRadius: 'var(--lumen-radius-component-md)',
        fontSize: '0.875rem',
      }}
    >
      Reduced-motion preference detected — token-driven motion is disabled.
    </div>
  );
}

function Body() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: 'var(--lumen-color-background-canvas)',
        color: 'var(--lumen-color-foreground-default)',
        fontFamily: 'var(--lumen-font-family-sans)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <header>
        <h1 style={{ marginBottom: '0.25rem' }}>Lumen {VERSION}</h1>
        <p style={{ color: 'var(--lumen-color-foreground-muted)', margin: 0 }}>
          Phase 03 — theming, direction, reduced motion.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <ThemeSwitcher />
      </div>
      <ReducedMotionBanner />

      <div
        style={{
          padding: '1rem',
          background: 'var(--lumen-color-background-surface)',
          border: '1px solid var(--lumen-color-border-default)',
          borderRadius: 'var(--lumen-radius-component-lg)',
          boxShadow: 'var(--lumen-shadow-sm)',
        }}
      >
        <p style={{ marginTop: 0 }}>
          Surface card. The background, foreground, border, accent and shadow all come from CSS
          custom properties, so swapping <code>data-theme</code> repaints everything in one frame.
        </p>
        <RadixDirectionDemo />
      </div>
    </div>
  );
}

export function App() {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  return (
    <ThemeProvider
      defaultTheme="system"
      themes={['system', 'light', 'dark', 'terminal', 'high-contrast']}
      disableTransitionOnChange
    >
      <DirectionProvider dir={dir}>
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 1,
            background: 'var(--lumen-color-background-raised)',
            border: '1px solid var(--lumen-color-border-default)',
            borderRadius: 'var(--lumen-radius-component-md)',
            padding: '0.5rem 0.75rem',
            boxShadow: 'var(--lumen-shadow-sm)',
          }}
        >
          <DirectionSwitcher dir={dir} onChange={setDir} />
        </div>
        <Body />
      </DirectionProvider>
    </ThemeProvider>
  );
}
