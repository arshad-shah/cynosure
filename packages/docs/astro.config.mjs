import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { SIDEBAR_GROUPS, componentsBySidebarGroup } from '../../components.config.mjs';

// Derive the component sidebar sections from the repo-root manifest so adding
// a component is one edit there instead of seven across configs.
const componentsByGroup = componentsBySidebarGroup();
const componentSidebarSections = SIDEBAR_GROUPS.map((label) => ({
  label,
  items: componentsByGroup[label].map((c) => ({
    label: c.sidebarLabel ?? c.name,
    slug: `components/${c.slug}`,
    ...(c.sidebarBadge ? { badge: c.sidebarBadge } : {}),
  })),
}));

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');

// Starlight ships Expressive Code, search (pagefind), sidebar, TOC, mobile
// nav, skip-link, prefers-reduced-motion, dark/light theme, keyboard nav, and
// scroll-spy out of the box — matching how the swiftchart docs are built.
// Cynosure's custom palette/typography is preserved by `customCss` overriding
// Starlight's `--sl-*` CSS variables (see styles/starlight-theme.css).
export default defineConfig({
  site: 'https://cynosure.arshadshah.com',
  integrations: [
    starlight({
      title: 'Cynosure',
      description: 'A React component library and design system.',
      favicon: '/favicon.svg',
      // Brand mark in the top-left replaces the plain-text title. Using the
      // mark + lockup gives parity with the Storybook manager UI (which
      // already brands with `cynosure-lockup.svg`).
      logo: {
        src: './src/assets/cynosure-mark.svg',
        replacesTitle: false,
        alt: 'Cynosure',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/arshad-shah/cynosure' },
      ],
      customCss: [
        './src/styles/fonts.css',
        './src/styles/starlight-theme.css',
        // `site.css` carries shared visual chrome (typography, surface
        // tokens, code-block defaults). The home page now uses Starlight's
        // built-in splash hero + Tabs/CardGrid components, so no bespoke
        // landing styles are needed. `doc-page.css` rules are scoped to
        // `[data-doc-layout]` — a Starlight build never matches that
        // selector, so loading it is a no-op everywhere except inside the
        // old preview iframe routes.
        './src/styles/site.css',
      ],
      // Drop the built-in Pagefind invocation — our existing build script
      // already runs `pagefind --site dist` and syncs the bundle in. Starlight
      // detects the index by file path either way.
      pagefind: true,
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://cynosure.arshadshah.com/og-image.png',
          },
        },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        // Top-right Storybook link, slotted via Starlight's `SocialIcons`
        // override below would replace the GitHub link — instead inject a
        // direct anchor into <head> as a fallback. The actual nav link comes
        // from the custom override component (./src/components/Header.astro).
      ],
      components: {
        // Custom Header overrides Starlight's default header so we can slot
        // a `Storybook` link next to the social-icons row. Everything else
        // (logo, search, mobile-nav, theme-switcher) stays Starlight default.
        SocialIcons: './src/components/Chrome/SocialIcons.astro',
        // Renders the frontmatter `description` as a lede paragraph under
        // each page's H1 so a visitor lands and immediately sees what the
        // component is for — no scrolling past the live preview required.
        PageTitle: './src/components/Chrome/PageTitle.astro',
      },
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quickstart', slug: 'getting-started/quickstart' },
            { label: 'RSC', slug: 'getting-started/rsc' },
            { label: 'RTL', slug: 'getting-started/rtl' },
          ],
        },
        {
          label: 'Foundations',
          items: [
            { label: 'Design principles', slug: 'foundations/design-principles' },
            { label: 'Design tokens', slug: 'foundations/design-tokens' },
            { label: 'Theming overview', slug: 'foundations/theming-overview' },
            { label: 'Dark mode', slug: 'foundations/dark-mode' },
            { label: 'Custom themes', slug: 'foundations/custom-themes' },
            { label: 'Terminal theme recipe', slug: 'foundations/terminal-theme-recipe' },
            { label: 'Accessibility', slug: 'foundations/accessibility' },
          ],
        },
        // Component sections are derived from the repo-root manifest — see
        // the top of this file. Order matches `SIDEBAR_GROUPS`.
        ...componentSidebarSections,
        {
          label: 'Recipes',
          items: [
            { label: 'Index', slug: 'recipes' },
            { label: 'Command palette', slug: 'recipes/command-palette' },
            { label: 'Dashboard layout', slug: 'recipes/dashboard-layout' },
            { label: 'Data table with filters', slug: 'recipes/data-table-with-filters' },
            { label: 'Login form', slug: 'recipes/login-form' },
            { label: 'Multi-step wizard', slug: 'recipes/multi-step-wizard' },
            { label: 'Notification center', slug: 'recipes/notification-center' },
            { label: 'Settings page', slug: 'recipes/settings-page' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Using with frameworks', slug: 'guides/frameworks' },
            { label: 'Tree-shaking & bundle size', slug: 'guides/tree-shaking' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Type reference', slug: 'reference/types' },
            { label: 'Migration to v1', slug: 'reference/migration-to-v1' },
            { label: 'Roadmap', slug: 'reference/roadmap' },
          ],
        },
        {
          label: 'Changelog',
          items: [{ label: 'Releases', slug: 'changelog' }],
        },
      ],
    }),
    mdx(),
    react(),
    sitemap(),
  ],
  vite: {
    resolve: {
      alias: {
        '@brand': resolve(repoRoot, 'brand'),
        '@docs-root': resolve(repoRoot, 'docs'),
        '@repo': repoRoot,
      },
    },
    ssr: {
      noExternal: [
        '@arshad-shah/cynosure-react',
        '@arshad-shah/cynosure-tokens',
        '@arshad-shah/cynosure-themes',
      ],
    },
  },
});
