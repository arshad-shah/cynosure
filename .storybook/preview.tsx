import type { Preview } from "@storybook/react-vite";
import "../src/styles/base.css";

// Source CSS (HMR in dev): foundations and components. Default tokens come from the generated stylesheet.
import.meta.glob(["../src/foundations/**/*.css", "../src/components/**/*.css", "../src/theme/*.css"], {
  eager: true,
});

import "../dist/styles/tokens.css";

const preview: Preview = {
  parameters: { a11y: { test: "error" }, layout: "padded" },
  tags: ["autodocs"],
};
export default preview;
