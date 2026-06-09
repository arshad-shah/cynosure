import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createConfig } from '@arshad-shah/cynosure-config/tsup.config.base';
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import { componentEntries } from '../../components.config.mjs';

/**
 * Cascade-preserving "keep-first" dedupe at brace depth 0. Lightning CSS's
 * minifier dedupes identical adjacent rules but does not preserve
 * first-occurrence ordering across an entire concatenated bundle — and that
 * ordering is load-bearing here. vanilla-extract re-emits the shared
 * `layoutPropsStyle`/`typographyBase` rules into every component's CSS;
 * naive concat puts a late copy after each component's own variant rules,
 * so e.g. `Mark variant="marker"`'s `background-color` is overridden by a
 * `layoutPropsStyle` reassertion that comes later in the file. Keeping only
 * the first copy moves the shared rule above every variant rule in the
 * cascade and makes the variant win.
 */
function dedupeCssRules(css: string): string {
  type Item = { kind: 'block' | 'comment' | 'whitespace'; text: string };
  const items: Item[] = [];
  let i = 0;
  while (i < css.length) {
    // Whitespace run.
    if (/\s/.test(css[i] ?? '')) {
      let j = i;
      while (j < css.length && /\s/.test(css[j] ?? '')) j++;
      items.push({ kind: 'whitespace', text: css.slice(i, j) });
      i = j;
      continue;
    }
    // /* comment */
    if (css[i] === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) {
        items.push({ kind: 'comment', text: css.slice(i) });
        break;
      }
      items.push({ kind: 'comment', text: css.slice(i, end + 2) });
      i = end + 2;
      continue;
    }
    // A rule or at-rule that ends at the next matching `}` at depth 0. A
    // simple brace-balance walk is sufficient because vanilla-extract's
    // output is well-formed and never embeds `{`/`}` inside string
    // literals at the top level.
    let depth = 0;
    let j = i;
    let started = false;
    while (j < css.length) {
      const c = css[j];
      if (c === '{') {
        depth++;
        started = true;
      } else if (c === '}') {
        depth--;
        if (started && depth === 0) {
          j++;
          break;
        }
      }
      j++;
    }
    if (!started) {
      // No more braces — bail and dump the remainder verbatim.
      items.push({ kind: 'block', text: css.slice(i) });
      break;
    }
    items.push({ kind: 'block', text: css.slice(i, j) });
    i = j;
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    if (item.kind === 'block') {
      const key = item.text.replace(/\s+/g, ' ').trim();
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(item.text);
  }
  return out.join('');
}

const hookEntries = (): Record<string, string> => {
  const dir = join(process.cwd(), 'src/hooks');
  const entries: Record<string, string> = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.ts') || file === 'index.ts') continue;
    const name = file.replace(/\.ts$/, '');
    entries[`hooks/${name}`] = `src/hooks/${file}`;
  }
  entries['hooks/index'] = 'src/hooks/index.ts';
  return entries;
};

export default createConfig({
  entry: {
    index: 'src/index.ts',
    'theme/index': 'src/theme/index.ts',
    'primitives/index': 'src/primitives/index.ts',
    'typography/index': 'src/typography/index.ts',
    'forms/index': 'src/forms/index.ts',
    'overlay/index': 'src/overlay/index.ts',
    'navigation/index': 'src/navigation/index.ts',
    'data-display/index': 'src/data-display/index.ts',
    'feedback/index': 'src/feedback/index.ts',
    'utils/index': 'src/utils/index.ts',
    ...hookEntries(),
    // Per-component entries — declared in `components.config.mjs` at the
    // repo root. Adding a component is one row there; this map regenerates
    // itself.
    ...(componentEntries() as Record<string, string>),
  },
  esbuildPlugins: [vanillaExtractPlugin()],
  loader: { '.css': 'copy' },
  async onSuccess() {
    const { readdir, readFile, writeFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const { createRequire } = await import('node:module');
    const { gzipSync } = await import('node:zlib');
    const dist = join(process.cwd(), 'dist');
    const files = (await readdir(dist))
      .filter((f) => f.endsWith('.css') && f !== 'styles.css' && f !== 'all.css')
      .sort();
    const chunks: string[] = [];
    for (const file of files) {
      chunks.push(`/* ${file} */`);
      chunks.push(await readFile(join(dist, file), 'utf8'));
    }

    // Prepend `@property` declarations for every layout custom property so
    // none of them inherit. Without this, setting e.g. `position="fixed"` on
    // an outer Flex would set `--cynosure-lp-pos-base: fixed` on that
    // element, all descendants would inherit it, and every descendant's
    // `layoutPropsStyle` would resolve `position: fixed` — collapsing the
    // entire subtree to the same fixed rectangle. `inherits: false` scopes
    // each var to the element it's declared on; inline-style overrides on
    // children still apply because inline styles win against the @property
    // initial value.
    //
    // Generated from the same `LAYOUT_PROPS` × `BP_LADDERS` matrix used by
    // `layoutStyle.css.ts`, kept in lockstep at build time so a new layout
    // prop or breakpoint can't silently leak inheritance again.
    const LAYOUT_VAR_BASES = [
      'cynosure-lp-p',
      'cynosure-lp-px',
      'cynosure-lp-py',
      'cynosure-lp-pt',
      'cynosure-lp-pr',
      'cynosure-lp-pb',
      'cynosure-lp-pl',
      'cynosure-lp-m',
      'cynosure-lp-mx',
      'cynosure-lp-my',
      'cynosure-lp-mt',
      'cynosure-lp-mr',
      'cynosure-lp-mb',
      'cynosure-lp-ml',
      'cynosure-lp-w',
      'cynosure-lp-h',
      'cynosure-lp-minw',
      'cynosure-lp-maxw',
      'cynosure-lp-minh',
      'cynosure-lp-maxh',
      'cynosure-lp-bg',
      'cynosure-lp-fg',
      'cynosure-lp-bc',
      'cynosure-lp-bw',
      'cynosure-lp-bs',
      'cynosure-lp-br',
      'cynosure-lp-sh',
      'cynosure-lp-op',
      'cynosure-lp-ov',
      'cynosure-lp-ovx',
      'cynosure-lp-ovy',
      'cynosure-lp-d',
      'cynosure-lp-pos',
      'cynosure-lp-top',
      'cynosure-lp-right',
      'cynosure-lp-bottom',
      'cynosure-lp-left',
      'cynosure-lp-z',
      'cynosure-lp-gc',
      'cynosure-lp-gr',
      'cynosure-lp-ga',
      'cynosure-lp-flex',
      // `cynosure-lp-grow` rather than `lp-fg` — the `fg` slug is reserved
      // for `color` (foreground); see layoutStyle.css.ts.
      'cynosure-lp-grow',
      'cynosure-lp-fs',
      'cynosure-lp-fb',
      'cynosure-lp-as',
      'cynosure-lp-js',
      'cynosure-lp-order',
    ];
    const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
    const propertyDecls: string[] = [
      '/* @property declarations — element-scoped layout custom properties.',
      ' * Generated by tsup.config.ts; keeps positional / sizing vars from',
      ' * inheriting onto descendants. */',
    ];
    // dedupe — some bases collide (e.g. flex-grow's `lp-fg` vs foreground's
    // `lp-fg`, though they're different aliases). The Set guards against
    // emitting duplicate @property rules which CSS treats as the same.
    const seen = new Set<string>();
    for (const base of LAYOUT_VAR_BASES) {
      for (const bp of BREAKPOINTS) {
        const name = `--${base}-${bp}`;
        if (seen.has(name)) continue;
        seen.add(name);
        propertyDecls.push(
          // syntax "*" allows initial-value to be omitted; that resolves to
          // "the guaranteed-invalid value" so `var(--x)` falls back exactly
          // as if the var were never set.
          `@property ${name} { syntax: "*"; inherits: false; }`,
        );
      }
    }
    chunks.unshift(propertyDecls.join('\n'));

    // Body reset — sets the default font family / text color / antialiasing
    // on `<body>` so that raw `<p>`/`<span>`/text nodes inherit the Cynosure
    // sans stack instead of the UA default (Times on macOS, Times New Roman
    // on Windows). Cynosure components style their own elements, but plain
    // markup that isn't wrapped in `<Text>`/`<Heading>` would otherwise look
    // like an unstyled document. Kept minimal — only the things a consumer
    // could never reasonably want different from the design system.
    const baseReset = `
/* @arshad-shah/cynosure-react — base reset */
body {
  font-family: var(--cynosure-font-family-sans);
  color: var(--cynosure-color-foreground-default);
  background-color: var(--cynosure-color-background-canvas);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
`;
    chunks.push(baseReset);

    // Deduplicate identical rule blocks across the concatenated component
    // CSS. Every tsup chunk that imports a shared vanilla-extract style
    // (e.g. `layoutPropsStyle`, `typographyBase`) re-emits that rule into
    // its own `.css` output. Concatenating them naively produces six+
    // copies of the same rule near the end of `styles.css`. Because the
    // last identical-specificity rule wins the cascade, those late copies
    // override `background-color` set by a component's variant rule
    // earlier in the file (variants like `Mark variant="marker"` rely on
    // setting `background-color`, but `layoutPropsStyle` re-asserts
    // `background-color: var(--cynosure-lp-bg-base)` from a later
    // position, which the browser resolves to `transparent` when no
    // override is present). One copy at the first occurrence preserves
    // the rule without re-asserting it later.
    const stylesCss = dedupeCssRules(chunks.join('\n'));
    await writeFile(join(dist, 'styles.css'), stylesCss);

    // Minify every emitted CSS bundle with Lightning CSS. Cuts the wire size
    // by ~60% on the big bundles (styles.css/all.css go from ~800 KB raw to
    // ~310 KB; gzip drops from ~265 KB to ~36 KB) by collapsing whitespace,
    // merging longhand → shorthand, and removing redundant rules. Run after
    // dedupeCssRules so the cascade-preserving dedupe still sees readable
    // input. JS bundles are intentionally left unminified.
    const { transform } = await import('lightningcss');
    const minifyCss = async (path: string) => {
      const src = await readFile(path);
      const out = transform({ filename: path, code: src, minify: true });
      await writeFile(path, out.code);
    };

    // Additionally emit `all.css`: a single-import bundle that includes design
    // tokens (light + dark overrides) alongside every component's CSS. This is
    // the zero-config path — consumers import one file instead of three.
    const require = createRequire(import.meta.url);
    const tokensPkgJson = require.resolve('@arshad-shah/cynosure-tokens/package.json');
    const tokensDist = join(tokensPkgJson, '..', 'dist', 'css');
    const baseCss = await readFile(join(tokensDist, 'base.css'), 'utf8');
    const darkCss = await readFile(join(tokensDist, 'dark.css'), 'utf8');
    const allCss = [
      '/* @arshad-shah/cynosure-tokens/css (base) */',
      baseCss,
      '/* @arshad-shah/cynosure-tokens/css/dark */',
      darkCss,
      '/* @arshad-shah/cynosure-react/styles.css */',
      stylesCss,
    ].join('\n');
    await writeFile(join(dist, 'all.css'), allCss);

    // Emit `fonts.css`: opt-in webfont loader for the default theme
    // (Geist + JetBrains Mono Variable). Kept separate from `all.css`
    // because the woff2 payload is ~400 KB and many consumers ship their
    // own font pipeline (next/font, self-hosted, CDN).
    const fontsCss = await readFile(join(process.cwd(), 'src', 'fonts.css'), 'utf8');
    await writeFile(join(dist, 'fonts.css'), fontsCss);

    // Minify every CSS in dist (per-component bundles + styles.css + all.css
    // + fonts.css). Done last so all writes above are already on disk.
    const allCssFiles = (await readdir(dist)).filter((f) => f.endsWith('.css'));
    await Promise.all(allCssFiles.map((f) => minifyCss(join(dist, f))));

    // Emit `sizes.json` — the canonical bundle-size manifest. Keyed by the
    // same `entry` field as `components.config.mjs`, plus a few well-known
    // bundles (`styles`, `all`, `index`, `fonts`). The docs site reads this
    // straight from `packages/react/dist/sizes.json` to populate the size
    // pill on every component page; size-limit.json stays for CI budgets.
    // Sizes are measured *after* all minification + dedupe so the numbers
    // match what consumers actually ship.
    const sizeOf = async (file: string) => {
      try {
        const buf = await readFile(join(dist, file));
        return { raw: buf.byteLength, gz: gzipSync(buf).byteLength };
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw err;
      }
    };

    const { COMPONENTS } = await import('../../components.config.mjs');
    type SizePair = { raw: number; gz: number };
    type Entry = { js: SizePair | null; css: SizePair | null };
    const components: Record<string, Entry> = {};
    for (const c of COMPONENTS as Array<{ slug: string; entry: string }>) {
      components[c.slug] = {
        js: await sizeOf(`${c.entry}.js`),
        css: await sizeOf(`${c.entry}.css`),
      };
    }
    const bundles: Record<string, Entry> = {};
    for (const [key, entry] of [
      ['styles', 'styles'],
      ['all', 'all'],
      ['index', 'index'],
      ['fonts', 'fonts'],
    ] as const) {
      bundles[key] = {
        js: await sizeOf(`${entry}.js`),
        css: await sizeOf(`${entry}.css`),
      };
    }
    await writeFile(
      join(dist, 'sizes.json'),
      `${JSON.stringify(
        { generatedAt: new Date().toISOString(), components, bundles },
        null,
        2,
      )}\n`,
    );
  },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-context-menu',
    '@radix-ui/react-dialog',
    '@radix-ui/react-direction',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-hover-card',
    '@radix-ui/react-menubar',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-slot',
    '@radix-ui/react-tabs',
    '@radix-ui/react-switch',
    '@radix-ui/react-tooltip',
    'class-variance-authority',
    'react-aria-components',
    '@internationalized/date',
    'sonner',
    '@radix-ui/react-scroll-area',
    '@tanstack/react-table',
    '@radix-ui/react-avatar',
    '@radix-ui/react-toggle',
    '@radix-ui/react-toggle-group',
    'react-resizable-panels',
    'shiki',
    'react-hook-form',
    'cmdk',
    'embla-carousel-react',
    'embla-carousel',
    '@arshad-shah/swift-chart',
    '@arshad-shah/swift-chart/react',
    'react-is',
  ],
});
