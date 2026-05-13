import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: [
    // Storybook is the component dev + showcase surface only.
    // Long-form docs live in the Astro site under packages/docs and must not
    // be duplicated here. Stories carry autodocs (`tag: 'autodocs'`) so a
    // per-component "Docs" tab is still generated from the .stories.tsx.
    '../packages/react/**/*.stories.@(ts|tsx)',
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
  staticDirs: [{ from: '../brand', to: '/brand' }],
  // When the static Storybook build is meant to be served from a subpath of
  // the docs site (`cynosure.arshadshah.com/storybook/`), set the env var
  // `STORYBOOK_BASE_PATH=/storybook/` before running `storybook build`. The
  // dev server keeps the default `/` base, so local DX is unchanged.
  async viteFinal(config) {
    const base = process.env.STORYBOOK_BASE_PATH;
    if (base) config.base = base;
    return config;
  },
};

export default config;
