// @ts-check
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import { createCssVariablesTheme } from "shiki";
import remarkRepoLinks from "./src/remark-repo-links.mjs";
import { REPO, routeOf } from "./src/routes.ts";

// Static output, served by Cloudflare Pages from site/dist (Storybook is built into site/dist/storybook afterwards).
export default defineConfig({
  site: "https://cynosure.arshadshah.com",
  output: "static",
  outDir: "dist",
  integrations: [react()],
  build: { format: "directory" },
  markdown: {
    // Code takes Cynosure's own colours: Shiki writes --shiki-* variables, and syntax.css sets them from the tokens.
    shikiConfig: { theme: createCssVariablesTheme({ name: "cynosure", variablePrefix: "--shiki-" }) },
    remarkPlugins: [[remarkRepoLinks, { routeOf, repo: REPO }]],
  },
});
