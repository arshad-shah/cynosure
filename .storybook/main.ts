import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: [
    // Ordered so "Getting started" / "Foundations" / "Recipes" appear first
    // in the sidebar, followed by per-component docs + stories under
    // packages/react/src.
    '../docs/foundations/**/*.mdx',
    '../docs/recipes/**/*.mdx',
    '../packages/**/*.mdx',
    '../packages/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
  ],
  // react-docgen-typescript powers the Controls / props tables in Docs mode.
  // Enabling literal-value extraction lets CVA-driven unions (`variant`,
  // `colorScheme`, `size`, …) render as proper dropdowns. The prop filter
  // excludes node_modules so we don't spam the panel with inherited
  // React.HTMLAttributes noise.
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => !prop.parent || !/node_modules/.test(prop.parent.fileName),
    },
  },
  docs: { autodocs: 'tag' },
};

export default config;
