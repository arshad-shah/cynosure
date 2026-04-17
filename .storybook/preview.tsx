import { DirectionProvider, ThemeProvider, TooltipProvider } from '@lumen/react';
import type { Decorator, Preview } from '@storybook/react';
import '@lumen/tokens/css';
import '@lumen/tokens/css/dark';
import '@lumen/react/styles.css';
import '@lumen/themes/terminal';
import '@lumen/themes/high-contrast';
import './storybook.css';

const THEMES = ['system', 'light', 'dark', 'terminal', 'high-contrast'] as const;

const withProviders: Decorator = (Story, context) => {
  const theme = (context.globals.theme as (typeof THEMES)[number]) ?? 'light';
  const dir = (context.globals.direction as 'ltr' | 'rtl') ?? 'ltr';
  return (
    <ThemeProvider
      key={theme}
      defaultTheme={theme}
      themes={[...THEMES]}
      storage={null}
      disableTransitionOnChange
    >
      <TooltipProvider>
        <DirectionProvider dir={dir}>
          <div className="sb-canvas" data-dir={dir}>
            <Story />
          </div>
        </DirectionProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: 'error' },
    layout: 'padded',
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Primitives',
          'Typography',
          'Forms',
          'Overlay',
          'Navigation',
          'Data display',
          'Feedback',
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Lumen theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: THEMES.map((t) => ({ value: t, title: t })),
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Text direction',
      defaultValue: 'ltr',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withProviders],
  tags: ['autodocs'],
};

export default preview;
