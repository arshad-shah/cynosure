import { DirectionProvider, ThemeProvider, TooltipProvider } from '@arshad-shah/cynosure-react';
import type { Decorator, Preview } from '@storybook/react';
import '@arshad-shah/cynosure-tokens/fonts';
import '@arshad-shah/cynosure-tokens/css';
import '@arshad-shah/cynosure-tokens/css/dark';
import '@arshad-shah/cynosure-react/styles.css';
import '@arshad-shah/cynosure-themes/terminal';
import '@arshad-shah/cynosure-themes/high-contrast';
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
    // In dev, surface a11y violations as blocking errors so CI catches
    // regressions. In the deployed public Storybook, downgrade to 'todo'
    // so the panel still reports findings but visitors don't see red
    // blocking banners for minor, non-blocking issues. `import.meta.env.PROD`
    // is Vite's canonical build-time boolean — statically replaced.
    a11y: { test: import.meta.env.PROD ? 'todo' : 'error' },
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
      description: 'Cynosure theme',
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
