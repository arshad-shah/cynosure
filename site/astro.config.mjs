// @ts-check
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// Static output, served by Cloudflare Pages from site/dist (Storybook is built into site/dist/storybook afterwards).
export default defineConfig({
  site: "https://cynosure.arshadshah.com",
  output: "static",
  outDir: "dist",
  integrations: [react()],
  build: { format: "directory" },
});
