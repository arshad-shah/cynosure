/**
 * Per-component size budgets for `@arshad-shah/cynosure-react`.
 *
 * Every component's dist JS entry imports `./core.css` + `./<name>.css`
 * (auto-prepended by `tsup.config.ts#onSuccess`) so subpath consumers
 * pull styles automatically. The shared `core.css` is loaded ONCE
 * across an app's bundle no matter how many components are imported —
 * its cost is amortised. To keep the JS budgets reflective of the
 * marginal per-component JS cost (not the shared `core.css` baseline),
 * `modifyEsbuildConfig` registers an `empty` loader for `.css` so
 * size-limit measures the JS only. The CSS chunks are budgeted
 * separately at the bottom of this file.
 *
 * Budgets are set to the current factual size rounded up to a friendly
 * round number with a small headroom for incidental drift. To
 * re-baseline after a real change:
 *   pnpm size  →  read the "Size:" line  →  bump `limit` to the next
 *   sensible value above it.
 *
 * Authored in CJS because `size-limit` evaluates the config file with
 * Node's CommonJS loader.
 */
const ignoreCss = (config) => ({
  ...config,
  loader: { ...(config.loader ?? {}), '.css': 'empty' },
});

const jsOnly = (extra = []) => ({
  ignore: ['react', 'react-dom', ...extra],
  modifyEsbuildConfig: ignoreCss,
});

const COMPONENTS = [
  // Layout primitives
  ['Box', 'box.js', '2.5 kB'],
  ['Stack', 'stack.js', '3.25 kB'],
  ['Inline', 'inline.js', '2.75 kB'],
  ['Flex', 'flex.js', '2.75 kB'],
  ['Grid', 'grid.js', '2.75 kB'],
  ['Divider', 'divider.js', '1.25 kB'],

  // Typography
  ['Text', 'text.js', '3 kB'],
  ['Heading', 'heading.js', '3.25 kB'],
  ['Link', 'link.js', '3.75 kB'],

  // Forms — buttons & affordances
  ['Button', 'button.js', '2 kB'],
  ['IconButton', 'iconbutton.js', '2 kB'],
  ['Toggle', 'toggle.js', '1.25 kB'],

  // Forms — inputs
  ['Input', 'input.js', '4.5 kB'],
  ['Textarea', 'textarea.js', '4.25 kB'],
  ['Checkbox', 'checkbox.js', '2.5 kB'],
  ['Radio', 'radio.js', '2.25 kB'],
  ['Switch', 'switch.js', '2.5 kB'],
  ['Select', 'select.js', '50 kB'],
  ['Combobox', 'combobox.js', '53 kB'],
  ['DatePicker', 'datepicker.js', '66 kB'],
  ['Slider', 'slider.js', '14 kB'],

  // Overlay
  ['Dialog', 'dialog.js', '5.5 kB'],
  ['Drawer', 'drawer.js', '5.5 kB'],
  ['Popover', 'popover.js', '3.5 kB'],
  ['Tooltip', 'tooltip.js', '3 kB'],
  ['Toast', 'toast.js', '11 kB'],
  ['DropdownMenu', 'dropdownmenu.js', '13 kB'],

  // Navigation
  ['Tabs', 'tabs.js', '3 kB'],
  ['Breadcrumb', 'breadcrumb.js', '3.5 kB'],
  ['Pagination', 'pagination.js', '2.75 kB'],
  ['Sidebar', 'sidebar.js', '11 kB'],

  // Data display
  ['Card', 'card.js', '1.75 kB'],
  ['Table', 'table.js', '1 kB'],
  ['DataTable', 'data-table.js', '20 kB'],
  ['Tree', 'tree.js', '3.5 kB'],
  ['Accordion', 'accordion.js', '3.5 kB'],
  ['LinearProgress', 'linear-progress.js', '2.75 kB'],
  ['CircularProgress', 'circular-progress.js', '1.5 kB'],
  ['Skeleton', 'skeleton.js', '0.75 kB'],

  // Feedback
  ['Badge', 'badge.js', '1 kB'],
  ['Avatar', 'avatar.js', '1.5 kB'],
  ['Alert', 'alert.js', '6.5 kB'],

  // Forms — composite
  ['Form', 'form.js', '2 kB'],
];

const entries = COMPONENTS.map(([name, file, limit]) => ({
  name,
  path: `packages/react/dist/${file}`,
  limit,
  ...jsOnly(),
}));

entries.push({
  name: 'RHF adapter',
  path: 'packages/react/dist/rhf.js',
  limit: '2 kB',
  ...jsOnly(['react-hook-form']),
});

// Components that lean on a heavy externalised dependency (kept out of the
// bundle via `tsup.config.ts#external`). Ignore that dep so the budget tracks
// the marginal in-tree JS — the same thing every other entry measures —
// rather than the (huge, externalised) syntax-highlighter / charting lib.
entries.push(
  {
    name: 'CodeBlock',
    path: 'packages/react/dist/code-block.js',
    limit: '4.5 kB',
    ...jsOnly(['shiki']),
  },
  {
    name: 'Chart',
    path: 'packages/react/dist/chart.js',
    // 25 themed chart wrappers + live `--cynosure-chart-*` theme resolution.
    // SwiftChart itself stays externalised (see `jsOnly`), so this tracks only
    // the marginal in-tree wrapper/theming JS.
    limit: '2 kB',
    ...jsOnly(['@arshad-shah/swift-chart', '@arshad-shah/swift-chart/react']),
  },
);

entries.push({
  name: 'Full barrel (warning-only)',
  path: 'packages/react/dist/index.js',
  limit: '250 kB',
  ...jsOnly(),
});

// Shared CSS chunks: measured directly so the consumer-side per-import
// CSS cost is visible in CI even though it's hidden from the JS budgets.
//
// `core.css` is now just the universal scaffolding (@property layout-var
// declarations + body reset) every component imports first. The shared
// component *rules* are split into per-owner-set chunks under `dist/shared/`,
// so a single-component subpath import pulls only the chunks it shares
// (~1.5–3 kB brotli) rather than the whole baseline. The realistic ceiling
// for the full set of shared rules — what a category-barrel or the monolithic
// import loads, bundled and compressed together — stays bounded by
// `styles.css` below; a glob over the individually-compressed chunk files
// would overcount (per-file brotli overhead, no cross-file dedup) and isn't a
// meaningful transfer figure, so it's intentionally not budgeted here.
entries.push(
  { name: 'core.css (scaffolding)', path: 'packages/react/dist/core.css', limit: '2 kB' },
  { name: 'styles.css (monolithic CSS)', path: 'packages/react/dist/styles.css', limit: '24 kB' },
  { name: 'all.css (tokens + styles)', path: 'packages/react/dist/all.css', limit: '25 kB' },
);

module.exports = entries;
