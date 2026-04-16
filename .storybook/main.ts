import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../packages/**/*.mdx', '../packages/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  typescript: { reactDocgen: 'react-docgen-typescript' },
  docs: { autodocs: 'tag' },
};

export default config;
