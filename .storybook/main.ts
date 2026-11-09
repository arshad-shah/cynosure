import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";

const config: StorybookConfig = {
  framework: { name: "@storybook/react-vite", options: {} },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: [
    // GFM (tables, task lists) for the hand-written docs pages; plain MDX renders tables as text.
    {
      name: "@storybook/addon-docs",
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  core: { disableTelemetry: true },
  staticDirs: [{ from: "../brand", to: "/brand" }],
};
export default config;
