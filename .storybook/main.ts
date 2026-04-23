import type { StorybookConfig } from '@storybook/react-vite';

// `storybook build` sets NODE_ENV=production; `storybook dev` sets it to
// development. Used below to exclude dev-only addons from the deployed
// static bundle at cynosure.arshadshah.com.
const isProduction = process.env.NODE_ENV === 'production';

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: [
    // Ordered so "Getting started" / "Foundations" / "Recipes" appear first
    // in the sidebar, followed by per-component docs + stories under
    // packages/react/src. Scoped to packages/react so the Astro-based
    // packages/docs content collection (also *.mdx) isn't pulled in.
    '../docs/foundations/**/*.mdx',
    '../docs/recipes/**/*.mdx',
    '../packages/react/**/*.mdx',
    '../packages/react/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    // addon-vitest adds a "Tests" panel that only renders meaningful state
    // when Vitest is actively running (dev or CI). In a static production
    // bundle there's no runner, so the panel shows stale/empty state —
    // exclude it there to keep the public surface clean.
    ...(isProduction ? [] : ['@storybook/addon-vitest']),
  ],
  // Opt out of Storybook's anonymous usage telemetry. The deployed site is
  // public-facing, so every visitor would otherwise ping Storybook Cloud
  // on their behalf.
  core: { disableTelemetry: true },
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
  staticDirs: [{ from: '../brand', to: '/brand' }],
};

export default config;
