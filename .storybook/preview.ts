import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: 'error' },
    layout: 'centered',
    backgrounds: { disable: true },
  },
  tags: ['autodocs'],
};

export default preview;
