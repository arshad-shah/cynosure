import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');

export default defineConfig({
  site: 'https://cynosure.arshadshah.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
  },
  vite: {
    resolve: {
      alias: {
        '@brand': resolve(repoRoot, 'brand'),
        '@docs-root': resolve(repoRoot, 'docs'),
        '@repo': repoRoot,
      },
    },
    ssr: {
      noExternal: ['@arshad-shah/cynosure-react', '@arshad-shah/cynosure-tokens', '@arshad-shah/cynosure-themes'],
    },
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
