import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createConfig } from '@arshad-shah/cynosure-config/tsup.config.base';
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import { componentEntries } from '../../components.config.mjs';

/**
 * Strip CSS block comments from a built CSS string. Authors keep comments in
 * `.css.ts` sources for readability; production consumers ship none of them.
 *
 * Two categories pile up in the unprocessed output:
 * 1. esbuild's `/* vanilla-extract-css-ns:<file>?source=#<base64> *\/` marker
 *    that it prepends to every concatenated virtual CSS file. Each marker is
 *    a base64-encoded gzipped sourcemap (~3 KB) referenced only by the dev
 *    runtime; in the bundled output ~120 chunks contribute ~440 KB raw /
 *    ~225 KB gzip of dead payload to `styles.css`.
 * 2. Author doc comments (`/* …purpose… *\/`) preserved by esbuild.
 *
 * License banners (`/*! … *\/`) are preserved so attribution requirements
 * stay intact.
 */
function stripCssComments(css: string): string {
  return css.replace(/\/\*(?!!)[\s\S]*?\*\//g, '');
}

type CssItem = { kind: 'block' | 'comment' | 'whitespace'; text: string };

/**
 * Walk a CSS string at brace depth 0 and split it into top-level items:
 * comments, at-rules (`@media (...) { ... }`), and ordinary rules
 * (`.foo { ... }`). Items are returned in source order so callers can
 * dedupe or extract while preserving the cascade.
 */
function splitTopLevelCssItems(css: string): CssItem[] {
  const items: CssItem[] = [];
  let i = 0;
  while (i < css.length) {
    if (/\s/.test(css[i] ?? '')) {
      let j = i;
      while (j < css.length && /\s/.test(css[j] ?? '')) j++;
      items.push({ kind: 'whitespace', text: css.slice(i, j) });
      i = j;
      continue;
    }
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
    // Rule or at-rule. Brace-balance walk; vanilla-extract output never
    // embeds `{`/`}` in top-level string literals.
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
      items.push({ kind: 'block', text: css.slice(i) });
      break;
    }
    items.push({ kind: 'block', text: css.slice(i, j) });
    i = j;
  }
  return items;
}

const normalizeBlock = (text: string): string => text.replace(/\s+/g, ' ').trim();

/**
 * Drop subsequent identical block occurrences from a single CSS string.
 * Preserves the cascade by keeping the first occurrence in place.
 */
function dedupeCssRules(css: string): string {
  const items = splitTopLevelCssItems(css);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    if (item.kind === 'block') {
      const key = normalizeBlock(item.text);
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(item.text);
  }
  return out.join('');
}

/**
 * Cross-file extraction. Given per-component CSS chunk contents keyed by
 * filename, identify rule blocks that appear in 2+ files and pull them
 * into a single shared chunk. Returns:
 * - `shared`: the concatenated shared CSS, in the order each block was
 *   first seen across the alphabetically-sorted files.
 * - `slimmed`: the per-file CSS with shared blocks removed.
 *
 * Why: per-component imports (`@arshad-shah/cynosure-react/text`,
 * `…/heading`, etc.) each carry their own copy of `layoutPropsStyle`,
 * `typographyBase`, control sizes, focus rings, etc. The full duplication
 * cost is ~960 KB raw across ~28 chunks. Hoisting them into `core.css`
 * — which the per-component JS chunks import alongside their own
 * stylesheet — lets bundlers dedupe to a single copy at the consumer's
 * end, while the monolithic `styles.css` path is unaffected because it
 * still concatenates everything.
 *
 * Identification: a block is "shared" iff its byte-identical (whitespace-
 * normalised) text appears in 2+ files. Comments and whitespace items are
 * neither counted nor moved.
 */
function extractSharedBlocks(perFile: ReadonlyArray<{ file: string; css: string }>): {
  shared: string;
  slimmed: Map<string, string>;
} {
  const fileItems = new Map<string, CssItem[]>();
  for (const { file, css } of perFile) {
    fileItems.set(file, splitTopLevelCssItems(css));
  }
  // Count distinct files each normalized block appears in.
  const occurrences = new Map<string, number>();
  for (const items of fileItems.values()) {
    const localSeen = new Set<string>();
    for (const it of items) {
      if (it.kind !== 'block') continue;
      const k = normalizeBlock(it.text);
      if (!k || localSeen.has(k)) continue;
      localSeen.add(k);
      occurrences.set(k, (occurrences.get(k) ?? 0) + 1);
    }
  }
  const isShared = (key: string) => (occurrences.get(key) ?? 0) >= 2;

  // Emit shared blocks in first-occurrence order across the input file
  // list — which is alphabetical, matching how `styles.css` concatenates.
  // This keeps cascade-sensitive rule pairs (e.g. a shared base followed
  // by a same-specificity refinement) in the same relative order as they
  // appear in the monolithic bundle.
  const sharedOut: string[] = [];
  const sharedSeen = new Set<string>();
  for (const { file } of perFile) {
    const items = fileItems.get(file) ?? [];
    for (const it of items) {
      if (it.kind !== 'block') continue;
      const k = normalizeBlock(it.text);
      if (!isShared(k) || sharedSeen.has(k)) continue;
      sharedSeen.add(k);
      sharedOut.push(it.text);
    }
  }

  const slimmed = new Map<string, string>();
  for (const { file } of perFile) {
    const items = fileItems.get(file) ?? [];
    const kept: string[] = [];
    for (const it of items) {
      if (it.kind === 'block' && isShared(normalizeBlock(it.text))) continue;
      // Drop whitespace runs adjacent to extracted blocks; keeping them
      // would leave the per-component chunks scattered with leading/
      // trailing newlines that gzip handles fine but raw bytes don't.
      if (it.kind === 'whitespace') continue;
      kept.push(it.text);
    }
    slimmed.set(file, kept.join(''));
  }

  return { shared: sharedOut.join(''), slimmed };
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
  esbuildPlugins: [
    vanillaExtractPlugin({
      // Hash classes/vars with 1–2 char identifiers instead of the
      // verbose `<File>_<exportName>__<7charHash>` debug names. Cuts the
      // average hashed-classname length from ~33 chars to ~3, which shrinks
      // both `styles.css` and per-component chunks meaningfully (gzip
      // savings compound because the names are referenced many times).
      identifiers: 'short',
    }),
  ],
  loader: { '.css': 'copy' },
  async onSuccess() {
    const { readdir, readFile, writeFile, stat } = await import('node:fs/promises');
    const { join, relative, dirname } = await import('node:path');
    const { createRequire } = await import('node:module');
    const dist = join(process.cwd(), 'dist');

    // Discover every emitted `.css` file (top-level + barrel subdirs). The
    // tsup entry map produces both per-component leaves at the root
    // (`button.css`) and category barrels in subdirs (`forms/index.css`).
    const cssFiles: string[] = [];
    const walk = async (dir: string) => {
      for (const entry of await readdir(dir)) {
        const full = join(dir, entry);
        const st = await stat(full);
        if (st.isDirectory()) await walk(full);
        else if (entry.endsWith('.css')) cssFiles.push(full);
      }
    };
    await walk(dist);

    const RESERVED = new Set(['styles.css', 'all.css', 'fonts.css', 'core.css']);
    // Strip vanilla-extract debug markers + author doc comments from every
    // emitted `.css` chunk in place. esbuild prepends a
    // `/* vanilla-extract-css-ns:src/…?source=#<base64> */` marker when it
    // concatenates virtual CSS files into each chunk (3 KB per shared
    // module). Without scrubbing, every per-component chunk and the
    // monolithic `styles.css` ship hundreds of KB of dead source-map noise.
    for (const full of cssFiles) {
      if (RESERVED.has(relative(dist, full))) continue;
      const raw = await readFile(full, 'utf8');
      const cleaned = stripCssComments(raw);
      if (cleaned.length !== raw.length) await writeFile(full, cleaned);
    }

    // Classify: leaves are per-component `.css` at the root (e.g.
    // `button.css`). Barrels are aggregate chunks — the top-level
    // `index.css` and every `*/index.css` — which contain the union of
    // their members' rules. Shared-extraction only counts occurrences
    // across LEAVES so that a Button-specific rule appearing in both
    // `button.css` and the top-level barrel doesn't get falsely classified
    // as shared (it'd then be hoisted out of `button.css` even though only
    // Button uses it).
    const isBarrel = (path: string) => {
      const rel = relative(dist, path);
      return rel === 'index.css' || rel.endsWith('/index.css');
    };
    const componentLeaves = cssFiles
      .filter(
        (f) =>
          !RESERVED.has(relative(dist, f)) && !isBarrel(f) && relative(dist, f).indexOf('/') === -1,
      )
      .sort();
    const barrels = cssFiles.filter((f) => isBarrel(f)).sort();

    // Identify rule blocks shared across ≥2 component leaves and pull
    // them into a single `core.css`. Per-component imports
    // (`@arshad-shah/cynosure-react/text`, …) then carry only their own
    // chunk's specific rules and a one-line `import './core.css'` (added
    // below); bundlers dedupe `core.css` to a single load across N
    // per-component imports. Saves ~960 KB raw (gzip ~25 KB) of
    // `layoutPropsStyle`/`typographyBase`/etc. dupes across ~28 chunks.
    const leafCss = await Promise.all(
      componentLeaves.map(async (full) => ({
        file: relative(dist, full),
        css: await readFile(full, 'utf8'),
      })),
    );
    const { shared, slimmed } = extractSharedBlocks(leafCss);

    // Slim each leaf in place.
    for (const full of componentLeaves) {
      const rel = relative(dist, full);
      await writeFile(full, slimmed.get(rel) ?? '');
    }
    // Slim each barrel too — they contain the union of member rules and
    // therefore re-state every extracted block. Same `splitTopLevelCssItems`
    // pass identifies and removes them.
    const sharedKeys = new Set<string>();
    for (const item of splitTopLevelCssItems(shared)) {
      if (item.kind === 'block') sharedKeys.add(normalizeBlock(item.text));
    }
    for (const full of barrels) {
      const raw = await readFile(full, 'utf8');
      const slim = splitTopLevelCssItems(raw)
        .filter((it) => {
          if (it.kind === 'whitespace') return false;
          if (it.kind === 'block' && sharedKeys.has(normalizeBlock(it.text))) return false;
          return true;
        })
        .map((it) => it.text)
        .join('');
      await writeFile(full, slim);
    }

    // Collect every leaf's slimmed CSS for the monolithic `styles.css`
    // bundle later. core.css + these = the full stylesheet (barrels are
    // by construction the union of their members, so excluded).
    const slimmedLeaves: string[] = componentLeaves.map(
      (full) => slimmed.get(relative(dist, full)) ?? '',
    );

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
    const propertyDecls: string[] = [];
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
    const baseReset =
      'body{font-family:var(--cynosure-font-family-sans);color:var(--cynosure-color-foreground-default);background-color:var(--cynosure-color-background-canvas);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}';

    // `core.css` carries everything a per-component import needs in
    // addition to its own chunk: the @property declarations (must be
    // element-scoped before any layout var is read), the body reset, and
    // every block shared across ≥2 component leaves. Per-component JS
    // chunks `import './core.css'` at the top (added below), so consumers
    // using subpath imports get one deduped copy regardless of how many
    // components they pull.
    const coreCss = [propertyDecls.join(''), baseReset, shared].join('');
    await writeFile(join(dist, 'core.css'), coreCss);

    // Wire per-component JS to its CSS: prepend `import './core.css'` and
    // `import './<name>.css'` at the top of every emitted entry-point JS
    // file. `core.css` carries the shared rules used by ≥2 components
    // (layoutPropsStyle, typography base, control sizes, focus ring…),
    // extracted once via `extractSharedBlocks` above. Bundlers dedupe
    // `core.css` to a single copy regardless of how many components a
    // consumer imports, so the per-component .js + .css chunks stay
    // lean. Without the auto-import, a `import { Button } from
    // '…/button'` would pull JS but not the shared layout cascade —
    // visuals would silently break for consumers that don't separately
    // load `styles.css`.
    //
    // For `size-limit` to report accurate per-component JS sizes (rather
    // than inflating each by the shared core.css), configure the budget
    // entries with `modifyEsbuildConfig: (c) => ({ ...c, loader: { ...,
    // '.css': 'empty' } })` so CSS imports compile to no bytes. The
    // separate `Core CSS chunk` entry measures core.css standalone.
    const jsFiles = await readdir(dist);
    for (const file of jsFiles) {
      if (!file.endsWith('.js')) continue;
      if (file.startsWith('chunk-')) continue;
      const base = file.replace(/\.js$/, '');
      const cssPath = join(dist, `${base}.css`);
      let hasCss = false;
      try {
        await stat(cssPath);
        hasCss = true;
      } catch {
        /* pure JS entry (hooks, utils) */
      }
      if (!hasCss) continue;
      const jsPath = join(dist, file);
      const body = await readFile(jsPath, 'utf8');
      if (body.startsWith(`import './core.css';`)) continue;
      const prefix = `import './core.css';\nimport './${base}.css';\n`;
      await writeFile(jsPath, prefix + body);
    }
    // Same treatment for category barrels (forms/index.js, overlay/index.js, …).
    for (const barrel of barrels) {
      const rel = relative(dist, barrel);
      const jsRel = rel.replace(/\.css$/, '.js');
      const jsPath = join(dist, jsRel);
      try {
        const body = await readFile(jsPath, 'utf8');
        if (body.startsWith(`import '`)) {
          if (body.includes(`'../core.css'`) || body.includes(`'./core.css'`)) continue;
        }
        const depth = dirname(jsRel).split('/').length;
        const upTo = '../'.repeat(depth);
        const prefix = `import '${upTo}core.css';\nimport './index.css';\n`;
        await writeFile(jsPath, prefix + body);
      } catch {
        /* no JS pair for this CSS barrel — skip */
      }
    }

    // Build `styles.css` (monolithic single-import path): core (already
    // contains @property + baseReset + every shared block) + every
    // slimmed leaf. dedupe defends against any accidental block
    // repetition.
    const stylesCss = stripCssComments(dedupeCssRules([coreCss, ...slimmedLeaves].join('\n')));
    await writeFile(join(dist, 'styles.css'), stylesCss);

    // Additionally emit `all.css`: a single-import bundle that includes design
    // tokens (light + dark overrides) alongside every component's CSS. This is
    // the zero-config path — consumers import one file instead of three.
    const require = createRequire(import.meta.url);
    const tokensPkgJson = require.resolve('@arshad-shah/cynosure-tokens/package.json');
    const tokensDist = join(tokensPkgJson, '..', 'dist', 'css');
    const baseCss = await readFile(join(tokensDist, 'base.css'), 'utf8');
    const darkCss = await readFile(join(tokensDist, 'dark.css'), 'utf8');
    // Tokens are emitted by Style Dictionary as a full palette (~280 named
    // custom properties); React components only reference a semantic subset
    // (~128). The 152 unused tokens are mostly raw color ramps
    // (--cynosure-color-{gray,blue,…}-{50…950}). Filter `base.css` and
    // `dark.css` to declarations actually referenced from `stylesCss` so the
    // zero-config `all.css` bundle doesn't ship unused vars. The standalone
    // `@arshad-shah/cynosure-tokens/css` export keeps the full palette for
    // consumers who want it.
    const trimTokens = (tokenCss: string): string => {
      const referenced = new Set<string>();
      const refRe = /var\(\s*(--[a-zA-Z0-9_-]+)/g;
      for (const m of stylesCss.matchAll(refRe)) referenced.add(m[1]);
      // Iteratively expand: a referenced token's value may itself reference
      // another token; keep both so the resolved value chain stays intact.
      let added = true;
      while (added) {
        added = false;
        const lineRe = /(--[a-zA-Z0-9_-]+):\s*([^;]+);/g;
        for (const m of tokenCss.matchAll(lineRe)) {
          if (!referenced.has(m[1])) continue;
          for (const r of m[2].matchAll(refRe)) {
            if (!referenced.has(r[1])) {
              referenced.add(r[1]);
              added = true;
            }
          }
        }
      }
      // Rebuild the stylesheet: keep every rule head, but inside each
      // declaration block drop lines whose property isn't referenced.
      return splitTopLevelCssItems(tokenCss)
        .map((it) => {
          if (it.kind !== 'block') return it.text;
          const m = it.text.match(/^([^{]+)\{([\s\S]*)\}\s*$/);
          if (!m) return it.text;
          const head = m[1];
          const body = m[2];
          const kept = body
            .split(/;\s*/)
            .filter((decl) => {
              const dm = decl.match(/^\s*(--[a-zA-Z0-9_-]+)\s*:/);
              if (!dm) return decl.trim().length > 0;
              return referenced.has(dm[1]);
            })
            .join(';');
          if (!kept.trim()) return '';
          return `${head}{${kept.endsWith(';') ? kept : `${kept};`}}`;
        })
        .join('');
    };
    const allCss = stripCssComments(
      [trimTokens(baseCss), trimTokens(darkCss), stylesCss].join('\n'),
    );
    await writeFile(join(dist, 'all.css'), allCss);

    // Emit `fonts.css`: opt-in webfont loader for the default theme
    // (Geist + JetBrains Mono Variable). Kept separate from `all.css`
    // because the woff2 payload is ~400 KB and many consumers ship their
    // own font pipeline (next/font, self-hosted, CDN).
    const fontsCss = await readFile(join(process.cwd(), 'src', 'fonts.css'), 'utf8');
    await writeFile(join(dist, 'fonts.css'), fontsCss);
  },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@radix-ui/react-context-menu',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-menubar',
    '@radix-ui/react-navigation-menu',
    'react-aria-components',
    '@internationalized/date',
    'sonner',
    '@tanstack/react-table',
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
