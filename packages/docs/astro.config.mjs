import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

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
        {
          label: 'Typography',
          items: [
            { label: 'Blockquote', slug: 'components/blockquote' },
            { label: 'Code', slug: 'components/code' },
            { label: 'Heading', slug: 'components/heading' },
            { label: 'Kbd', slug: 'components/kbd' },
            { label: 'Link', slug: 'components/link' },
            { label: 'List', slug: 'components/list' },
            { label: 'Text', slug: 'components/text' },
          ],
        },
        {
          label: 'Buttons',
          items: [
            { label: 'Button', slug: 'components/button' },
            { label: 'ButtonGroup', slug: 'components/button-group' },
            { label: 'IconButton', slug: 'components/icon-button' },
            { label: 'Toggle', slug: 'components/toggle' },
            { label: 'ToggleGroup', slug: 'components/toggle-group' },
          ],
        },
        {
          label: 'Forms',
          items: [
            { label: 'Input', slug: 'components/input' },
            { label: 'Textarea', slug: 'components/textarea' },
            { label: 'NumberInput', slug: 'components/number-input' },
            { label: 'SearchInput', slug: 'components/search-input' },
            { label: 'PinInput', slug: 'components/pin-input' },
            { label: 'TagsInput', slug: 'components/tags-input' },
            { label: 'Checkbox', slug: 'components/checkbox' },
            { label: 'CheckboxGroup', slug: 'components/checkbox-group' },
            { label: 'Radio', slug: 'components/radio' },
            { label: 'RadioGroup', slug: 'components/radio-group' },
            { label: 'Switch', slug: 'components/switch' },
            { label: 'Select', slug: 'components/select' },
            { label: 'MultiSelect', slug: 'components/multi-select' },
            { label: 'Combobox', slug: 'components/combobox' },
            { label: 'Slider', slug: 'components/slider' },
            { label: 'RangeSlider', slug: 'components/range-slider' },
            { label: 'Rating', slug: 'components/rating' },
            { label: 'Calendar', slug: 'components/calendar' },
            { label: 'DatePicker', slug: 'components/date-picker' },
            { label: 'DateRangePicker', slug: 'components/date-range-picker' },
            { label: 'TimePicker', slug: 'components/time-picker' },
            { label: 'ColorPicker', slug: 'components/color-picker' },
            { label: 'FileUpload', slug: 'components/file-upload' },
            { label: 'Label', slug: 'components/label' },
            { label: 'HelperText', slug: 'components/helper-text' },
            { label: 'ErrorText', slug: 'components/error-text' },
            { label: 'Fieldset', slug: 'components/fieldset' },
            { label: 'Form', slug: 'components/form' },
            { label: 'RHF', slug: 'components/rhf' },
          ],
        },
        {
          label: 'Feedback',
          items: [
            { label: 'Alert', slug: 'components/alert' },
            { label: 'Avatar', slug: 'components/avatar' },
            { label: 'AvatarGroup', slug: 'components/avatar-group' },
            { label: 'Badge', slug: 'components/badge' },
            { label: 'Callout', slug: 'components/callout' },
            { label: 'Chip', slug: 'components/chip' },
            { label: 'EmptyState', slug: 'components/empty-state' },
            { label: 'Notification', slug: 'components/notification' },
            { label: 'Tag', slug: 'components/tag' },
          ],
        },
        {
          label: 'Overlays',
          items: [
            { label: 'AlertDialog', slug: 'components/alert-dialog' },
            { label: 'CommandPalette', slug: 'components/command-palette' },
            { label: 'ContextMenu', slug: 'components/context-menu' },
            { label: 'Dialog', slug: 'components/dialog' },
            { label: 'Drawer', slug: 'components/drawer' },
            { label: 'DropdownMenu', slug: 'components/dropdown-menu' },
            { label: 'HoverCard', slug: 'components/hover-card' },
            { label: 'MenuBar', slug: 'components/menu-bar' },
            { label: 'Popover', slug: 'components/popover' },
            { label: 'Toast', slug: 'components/toast' },
            { label: 'Tooltip', slug: 'components/tooltip' },
          ],
        },
        {
          label: 'Navigation',
          items: [
            { label: 'Anchor', slug: 'components/anchor' },
            { label: 'BackToTop', slug: 'components/back-to-top' },
            { label: 'Breadcrumb', slug: 'components/breadcrumb' },
            { label: 'Menu', slug: 'components/menu' },
            { label: 'NavigationMenu', slug: 'components/navigation-menu' },
            { label: 'Pagination', slug: 'components/pagination' },
            { label: 'Sidebar', slug: 'components/sidebar' },
            { label: 'Stepper', slug: 'components/stepper' },
            { label: 'Tabs', slug: 'components/tabs' },
          ],
        },
        {
          label: 'Data display',
          items: [
            { label: 'Accordion', slug: 'components/accordion' },
            { label: 'Card', slug: 'components/card' },
            { label: 'Carousel', slug: 'components/carousel' },
            { label: 'Chart', slug: 'components/chart' },
            { label: 'CircularProgress', slug: 'components/circular-progress' },
            { label: 'CodeBlock', slug: 'components/code-block' },
            { label: 'Collapsible', slug: 'components/collapsible' },
            { label: 'DataTable', slug: 'components/data-table', badge: 'beta' },
            { label: 'LinearProgress', slug: 'components/linear-progress' },
            { label: 'Resizable', slug: 'components/resizable' },
            { label: 'ScrollArea', slug: 'components/scroll-area' },
            { label: 'Skeleton', slug: 'components/skeleton' },
            { label: 'Spinner', slug: 'components/spinner' },
            { label: 'Stat', slug: 'components/stat' },
            { label: 'Table', slug: 'components/table' },
            { label: 'Timeline', slug: 'components/timeline' },
            { label: 'Tree', slug: 'components/tree' },
          ],
        },
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
