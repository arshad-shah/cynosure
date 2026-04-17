import type { Preview } from '@storybook/react';

/**
 * Global Storybook preview (Phase 14 hardened).
 *
 * `a11y.test = 'error'` fails the Vitest Storybook addon on any axe
 * violation so CI stops the merge. The `runOnly` tag list pins the audit to
 * WCAG 2.1 A + AA rules — individual stories can opt out of a specific rule
 * by overriding `parameters.a11y.config.rules` locally, but every exception
 * must be documented in the story file with a `why:` comment so it's
 * reviewable.
 */
const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: {
      test: 'error',
      // Keep global exceptions here (empty by design). Every entry must have
      // a comment explaining the rationale and a link to the relevant axe
      // rule documentation.
      config: {
        rules: [],
      },
      options: {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      },
    },
    layout: 'centered',
    backgrounds: { disable: true },
  },
  tags: ['autodocs'],
};

export default preview;
