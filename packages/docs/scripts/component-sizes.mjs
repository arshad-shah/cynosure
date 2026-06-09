// packages/docs/scripts/component-sizes.mjs
//
// Reads the bundle-size manifest emitted by the react package's build
// (`packages/react/dist/sizes.json`) and writes it to the docs `generated/`
// folder so Astro can import it as a stable, in-tree JSON. Also verifies
// every slug in `components.config.mjs` has matching size data — catching
// the case where a component is registered but the build hasn't run, or a
// rename hasn't been propagated.
//
// Runs as part of `pnpm --filter @arshad-shah/cynosure-docs build` (see
// docs/package.json `generate:sizes`). Turbo's `^build` dependency
// guarantees the react `dist/` exists before this script executes.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPONENTS } from '../../../components.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcManifest = join(__dirname, '..', '..', 'react', 'dist', 'sizes.json');
const outFile = join(__dirname, '..', 'src', 'generated', 'component-sizes.json');

if (!existsSync(srcManifest)) {
  process.stderr.write(
    `[component-sizes] missing ${srcManifest} — build the react package first ` +
      `(turbo's "^build" should handle this; run \`pnpm -w build\` to bootstrap).\n`,
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(srcManifest, 'utf8'));

const missing = COMPONENTS.filter((c) => !manifest.components?.[c.slug]);
if (missing.length) {
  process.stderr.write(
    `[component-sizes] manifest is missing entries for ${missing.length} component(s): ` +
      `${missing.map((c) => c.slug).join(', ')}. ` +
      'Re-run the react package build.\n',
  );
  process.exit(1);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(
  `[component-sizes] ${Object.keys(manifest.components).length} components + ` +
    `${Object.keys(manifest.bundles).length} bundles\n`,
);
