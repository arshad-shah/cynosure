import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { useTheme } from '../../theme/hooks/useTheme.js';
import { ThemeToggle } from '../ThemeToggle/index.js';

// Storage disabled so each test starts clean and nothing leaks to globals.
function withProvider(
  ui: React.ReactNode,
  props: Partial<React.ComponentProps<typeof ThemeProvider>> = {},
) {
  return (
    <ThemeProvider themes={['light', 'dark']} defaultTheme="light" storage={null} {...props}>
      {ui}
    </ThemeProvider>
  );
}

// Surfaces the resolved theme so tests can assert on state changes.
function ThemeReadout() {
  const { theme } = useTheme();
  return <output data-testid="theme">{theme}</output>;
}

describe('ThemeToggle', () => {
  describe('icon variant', () => {
    it('cycles through the modes on click', async () => {
      const user = userEvent.setup();
      render(
        withProvider(
          <>
            <ThemeToggle variant="icon" />
            <ThemeReadout />
          </>,
          { themes: ['light', 'dark'], defaultTheme: 'light', enableSystem: false },
        ),
      );
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      // Default modes include system, but with only light+dark allowed the
      // cycle still advances light → dark.
      await user.click(screen.getByRole('button', { name: /current: Light/i }));
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('names the current theme in the accessible label', () => {
      render(withProvider(<ThemeToggle variant="icon" modes={['light', 'dark']} />));
      expect(screen.getByRole('button', { name: /current: Light/i })).toBeInTheDocument();
    });
  });

  describe('switch variant', () => {
    it('reflects the resolved colour scheme and toggles light/dark', () => {
      render(
        withProvider(
          <>
            <ThemeToggle variant="switch" />
            <ThemeReadout />
          </>,
        ),
      );
      const control = screen.getByRole('switch');
      expect(control).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(control);
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(control).toHaveAttribute('aria-checked', 'true');
      fireEvent.click(control);
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
  });

  describe('segmented variant', () => {
    it('renders a radio per mode and selects on click', async () => {
      const user = userEvent.setup();
      render(
        withProvider(
          <>
            <ThemeToggle variant="segmented" modes={['light', 'dark']} showLabels />
            <ThemeReadout />
          </>,
        ),
      );
      const light = screen.getByRole('radio', { name: 'Light' });
      const dark = screen.getByRole('radio', { name: 'Dark' });
      expect(light).toHaveAttribute('aria-checked', 'true');
      await user.click(dark);
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(dark).toHaveAttribute('aria-checked', 'true');
    });

    it('keeps a theme selected when the active item is re-pressed', async () => {
      const user = userEvent.setup();
      render(
        withProvider(
          <>
            <ThemeToggle variant="segmented" modes={['light', 'dark']} />
            <ThemeReadout />
          </>,
        ),
      );
      // aria-label falls back to the mode label when showLabels is off.
      await user.click(screen.getByRole('radio', { name: 'Light' }));
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
  });

  describe('menu variant', () => {
    it('opens a radio group and switches theme on selection', async () => {
      const user = userEvent.setup();
      render(
        withProvider(
          <>
            <ThemeToggle variant="menu" modes={['light', 'dark']} label="Appearance" />
            <ThemeReadout />
          </>,
        ),
      );
      const trigger = screen.getByRole('button', { name: 'Appearance' });
      await user.click(trigger);
      const darkItem = await screen.findByRole('menuitemradio', { name: 'Dark' });
      await user.click(darkItem);
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
  });

  describe('customisation', () => {
    it('applies custom labels and icons', () => {
      render(
        withProvider(
          <ThemeToggle
            variant="segmented"
            modes={['light', 'dark']}
            showLabels
            labels={{ light: 'Day', dark: 'Night' }}
            icons={{
              light: <svg data-testid="day-icon" />,
              dark: <svg data-testid="night-icon" />,
            }}
          />,
        ),
      );
      expect(screen.getByRole('radio', { name: 'Day' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Night' })).toBeInTheDocument();
      expect(screen.getByTestId('day-icon')).toBeInTheDocument();
    });

    it('honours a custom modes list (no system option)', () => {
      render(
        withProvider(<ThemeToggle variant="segmented" modes={['light', 'dark']} showLabels />),
      );
      expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: 'System' })).not.toBeInTheDocument();
    });

    it('calls setTheme when system is offered', async () => {
      const user = userEvent.setup();
      render(
        withProvider(
          <>
            <ThemeToggle variant="segmented" />
            <ThemeReadout />
          </>,
          { themes: ['light', 'dark'], defaultTheme: 'light', enableSystem: true },
        ),
      );
      await user.click(screen.getByRole('radio', { name: 'System' }));
      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });
  });
});
