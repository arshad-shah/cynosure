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

interface SharedBlock {
  key: string;
  text: string;
}
interface SharingChunk {
  /** Sorted leaf filenames that contain every block in this chunk. */
  owners: string[];
  /** Blocks, in canonical (first-seen) order. */
  blocks: SharedBlock[];
}
interface Partition {
  /** Per-leaf CSS with all shared blocks removed (unique blocks only). */
  slimmed: Map<string, string>;
  /**
   * Every shared block in canonical (first-seen, alphabetical-leaf) order —
   * the exact sequence the monolithic `styles.css` concatenates. Kept whole
   * so that path stays byte-identical regardless of how blocks are chunked.
   */
  sharedCanon: string;
  /** One entry per distinct owner set, keyed by the joined owner signature. */
  chunks: Map<string, SharingChunk>;
  /** Canonical order index per normalized block (drives import ordering). */
  indexOf: Map<string, number>;
}

/**
 * Partition the per-leaf CSS into **sharing-set chunks**.
 *
 * A rule block that appears in ≥2 component leaves is "shared". Rather than
 * pile every shared block into one monolithic `core.css` — which a single
 * component's subpath import would then pull in full, even though most of it
 * belongs to *other* components — group shared blocks by their exact *owner
 * set* (the set of leaves that contain them). Each distinct owner set becomes
 * one chunk file, and a component imports only the chunks whose owner set
 * includes it. The CSS a subpath import loads is then exactly its own blocks,
 * no more: `Badge` no longer drags in the `{Select,Combobox}` listbox rules or
 * the `{DatePicker,DateRangePicker}` calendar rules it never uses.
 *
 * Blocks unique to a single leaf (owner set size 1) stay in that leaf. The
 * monolithic path is unaffected: `sharedCanon` preserves the original
 * first-seen ordering so `styles.css` concatenates byte-for-byte as before.
 *
 * Identification is byte-identical (whitespace-normalised) text, as before —
 * comments and whitespace are neither counted nor moved.
 */
function partitionSharedBlocks(perFile: ReadonlyArray<{ file: string; css: string }>): Partition {
  const fileItems = new Map<string, CssItem[]>();
  for (const { file, css } of perFile) {
    fileItems.set(file, splitTopLevelCssItems(css));
  }

  // Owner set per normalized block: which leaves contain it.
  const owners = new Map<string, Set<string>>();
  for (const [file, items] of fileItems) {
    const localSeen = new Set<string>();
    for (const it of items) {
      if (it.kind !== 'block') continue;
      const k = normalizeBlock(it.text);
      if (!k || localSeen.has(k)) continue;
      localSeen.add(k);
      let set = owners.get(k);
      if (!set) {
        set = new Set<string>();
        owners.set(k, set);
      }
      set.add(file);
    }
  }
  const isShared = (key: string) => (owners.get(key)?.size ?? 0) >= 2;

  // Canonical first-seen order across the alphabetically-sorted leaves. This
  // is the cascade order the monolithic bundle relies on; both `sharedCanon`
  // and each chunk's block list follow it so same-specificity pairs keep their
  // relative order.
  const canon: SharedBlock[] = [];
  const seen = new Set<string>();
  for (const { file } of perFile) {
    for (const it of fileItems.get(file) ?? []) {
      if (it.kind !== 'block') continue;
      const k = normalizeBlock(it.text);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      canon.push({ key: k, text: it.text });
    }
  }
  const indexOf = new Map<string, number>();
  canon.forEach((b, i) => indexOf.set(b.key, i));

  const slimmed = new Map<string, string>();
  for (const { file } of perFile) {
    const kept: string[] = [];
    for (const it of fileItems.get(file) ?? []) {
      // Drop whitespace runs adjacent to extracted blocks; keeping them would
      // scatter the per-component chunks with leading/trailing newlines.
      if (it.kind === 'whitespace') continue;
      if (it.kind === 'block' && isShared(normalizeBlock(it.text))) continue;
      kept.push(it.text);
    }
    slimmed.set(file, kept.join(''));
  }

  const sharedCanon = canon
    .filter((b) => isShared(b.key))
    .map((b) => b.text)
    .join('');

  const chunks = new Map<string, SharingChunk>();
  for (const b of canon) {
    if (!isShared(b.key)) continue;
    const set = owners.get(b.key) as Set<string>;
    const sortedOwners = [...set].sort();
    const sig = sortedOwners.join('|');
    let chunk = chunks.get(sig);
    if (!chunk) {
      chunk = { owners: sortedOwners, blocks: [] };
      chunks.set(sig, chunk);
    }
    chunk.blocks.push(b);
  }

  return { slimmed, sharedCanon, chunks, indexOf };
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
    const { readdir, readFile, writeFile, stat, rm, mkdir } = await import('node:fs/promises');
    const { join, relative, dirname } = await import('node:path');
    const { createRequire } = await import('node:module');
    const { createHash } = await import('node:crypto');
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
    const { slimmed, sharedCanon, chunks, indexOf } = partitionSharedBlocks(leafCss);

    // Slim each leaf in place. A leaf whose slimmed body is empty had *all*
    // its rules hoisted into `core.css` (every block was shared across ≥2
    // components), so the chunk would be a 0-byte file. Drop it entirely and
    // record the base name — the JS entry below imports `core.css` only,
    // skipping the dead `import './<name>.css'` that would otherwise resolve
    // to nothing (an extra module/request for every bundler downstream).
    const originalLeafBases = new Set(
      componentLeaves.map((full) => relative(dist, full).replace(/\.css$/, '')),
    );
    for (const full of componentLeaves) {
      const rel = relative(dist, full);
      const slim = slimmed.get(rel) ?? '';
      if (slim.trim().length === 0) {
        await rm(full, { force: true });
      } else {
        await writeFile(full, slim);
      }
    }
    // Slim each barrel too — they contain the union of member rules and
    // therefore re-state every extracted block. Same `splitTopLevelCssItems`
    // pass identifies and removes them.
    const sharedKeys = new Set<string>();
    for (const item of splitTopLevelCssItems(sharedCanon)) {
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

    // `core.css` is the universal scaffolding every component needs first:
    // the @property declarations (must be element-scoped before any layout var
    // is read) and the body reset. The shared *rules* no longer live here —
    // they're split into per-owner-set chunks below so a single-component
    // subpath import pulls only the chunks it actually shares, not the union
    // of every component's shared CSS. Per-component JS `import './core.css'`
    // first (added below).
    const coreCss = [propertyDecls.join(''), baseReset].join('');
    await writeFile(join(dist, 'core.css'), coreCss);

    // Emit one CSS file per distinct owner set under `shared/`. The filename
    // is a stable hash of the owner signature so it's deterministic across
    // builds (and only churns when a block's sharing set genuinely changes).
    // Build a leaf → chunks index plus a global chunk list (for barrels).
    await mkdir(join(dist, 'shared'), { recursive: true });
    interface ChunkMeta {
      rel: string;
      minIndex: number;
      size: number;
    }
    const chunksForLeaf = new Map<string, ChunkMeta[]>();
    const allChunks: ChunkMeta[] = [];
    for (const [sig, group] of chunks) {
      const hash = createHash('sha256').update(sig).digest('hex').slice(0, 8);
      const rel = `shared/${hash}.css`;
      await writeFile(join(dist, rel), stripCssComments(group.blocks.map((b) => b.text).join('')));
      const meta: ChunkMeta = {
        rel,
        minIndex: Math.min(...group.blocks.map((b) => indexOf.get(b.key) ?? 0)),
        size: group.owners.length,
      };
      allChunks.push(meta);
      for (const leaf of group.owners) {
        const list = chunksForLeaf.get(leaf) ?? [];
        list.push(meta);
        chunksForLeaf.set(leaf, list);
      }
    }
    // Import order: broadest owner set first (base rules shared by many),
    // then canonical order — so widely-shared bases load before narrower
    // specialisations, mirroring the cascade the monolithic bundle encodes.
    // The component's own leaf css (most specific) is appended last.
    const byBreadthThenOrder = (a: ChunkMeta, b: ChunkMeta) =>
      b.size - a.size || a.minIndex - b.minIndex;
    for (const list of chunksForLeaf.values()) list.sort(byBreadthThenOrder);
    allChunks.sort(byBreadthThenOrder);

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
      // Skip the root barrel (`index.js`). Its CSS pair is `index.css`,
      // which — alongside `core.css` — is the *entire* component stylesheet
      // (`core.css` + `index.css` ≈ `styles.css`). The barrel is the
      // monolithic-path entry: consumers import it for components and bring
      // the stylesheet themselves via `@arshad-shah/cynosure-react/all.css`
      // or `/styles.css` (required regardless, since design tokens live in a
      // separate package the barrel can't inject). Auto-injecting here would
      // load every rule twice for that documented setup — and the second,
      // re-injected `core.css` lands *after* the component-specific rules
      // from the manual stylesheet, so equal-specificity shared rules
      // (layoutPropsStyle, typography base, focus ring…) clobber the
      // component overrides that should win → silent visual regressions.
      // Per-component leaves and category barrels still auto-inject below;
      // the tree-shaking guide only promises CSS-rides-along for *those*
      // subpath entries, not the barrel.
      if (file === 'index.js') continue;
      const base = file.replace(/\.js$/, '');
      const cssPath = join(dist, `${base}.css`);
      // `-1` = no `.css` file. A leaf whose chunk was fully hoisted into
      // `core.css` had its file dropped above, so it reads as `-1` here even
      // though it still needs `core.css`.
      let ownCssBytes = -1;
      try {
        ownCssBytes = (await stat(cssPath)).size;
      } catch {
        /* css file absent — pure JS entry, or an emptied leaf (see below) */
      }
      const hadLeaf = originalLeafBases.has(base);
      // Pure JS entry (hooks, utils) — never had a CSS leaf, nothing to wire.
      if (!hadLeaf && ownCssBytes <= 0) continue;
      const jsPath = join(dist, file);
      const body = await readFile(jsPath, 'utf8');
      if (body.startsWith(`import './core.css';`)) continue;
      // core.css (scaffolding) → the owner-set chunks this component shares
      // (broadest first) → its own unique leaf css (if any), most specific
      // last. Together these are exactly this component's blocks and nothing
      // else.
      const lines = [`import './core.css';`];
      for (const c of chunksForLeaf.get(`${base}.css`) ?? []) lines.push(`import './${c.rel}';`);
      if (ownCssBytes > 0) lines.push(`import './${base}.css';`);
      await writeFile(jsPath, `${lines.join('\n')}\n${body}`);
    }
    // Same treatment for category barrels (forms/index.js, overlay/index.js, …).
    // The root barrel (`index.css` → `index.js`) is deliberately excluded —
    // see the `file === 'index.js'` skip above. It's the monolithic-path
    // entry, so it must not auto-inject `core.css` + `index.css` (the whole
    // stylesheet) on top of the consumer's manual `styles.css`/`all.css`.
    for (const barrel of barrels) {
      const rel = relative(dist, barrel);
      if (rel === 'index.css') continue;
      const jsRel = rel.replace(/\.css$/, '.js');
      const jsPath = join(dist, jsRel);
      // A barrel slimmed to nothing (every member rule was shared → core.css)
      // is dropped too, and its JS imports core.css only.
      let barrelBytes = 0;
      try {
        barrelBytes = (await stat(barrel)).size;
      } catch {
        /* already absent */
      }
      if (barrelBytes === 0) await rm(barrel, { force: true });
      try {
        const body = await readFile(jsPath, 'utf8');
        if (body.startsWith(`import '`)) {
          if (body.includes(`'../core.css'`) || body.includes(`'./core.css'`)) continue;
        }
        const depth = dirname(jsRel).split('/').length;
        const upTo = '../'.repeat(depth);
        // A category barrel bundles every member, so it needs the union of
        // their shared chunks — i.e. all of them (the same total CSS the old
        // single core.css carried). Order broad-first, then the barrel's own
        // unique-rules leaf last.
        const lines = [`import '${upTo}core.css';`];
        for (const c of allChunks) lines.push(`import '${upTo}${c.rel}';`);
        if (barrelBytes > 0) lines.push(`import './index.css';`);
        await writeFile(jsPath, `${lines.join('\n')}\n${body}`);
      } catch {
        /* no JS pair for this CSS barrel — skip */
      }
    }

    // Drop the now-orphaned root barrel stylesheet. `index.css` only ever
    // existed as `index.js`'s auto-import target; with the barrel no longer
    // injecting it (it's the monolithic path — consumers bring `styles.css`/
    // `all.css`), the file is dead. It isn't in the `exports` map, so leaving
    // it published would only risk a deep import (`…/dist/index.css`) that
    // re-creates the full-stylesheet duplication this change removes. Nothing
    // below reads it — `styles.css` is built from `coreCss` + slimmed leaves.
    await rm(join(dist, 'index.css'), { force: true });

    // Build `styles.css` (monolithic single-import path): core scaffolding
    // (@property + baseReset) + every shared block in canonical order + every
    // slimmed leaf. Using `sharedCanon` (not the chunk files) keeps this path
    // byte-identical to before regardless of how the shared rules are chunked.
    // dedupe defends against any accidental block repetition.
    const stylesCss = stripCssComments(
      dedupeCssRules([coreCss, sharedCanon, ...slimmedLeaves].join('\n')),
    );
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
    // Keep the provider's token-CSS side-effect imports as pass-through specifiers
    // so the consumer's bundler resolves them (enabling dedupe against a manual
    // `all.css` import) instead of esbuild inlining the tokens into our own CSS.
    '@arshad-shah/cynosure-tokens/css',
    '@arshad-shah/cynosure-tokens/css/dark',
    'react-is',
  ],
});
