#!/usr/bin/env node
/**
 * Aggregates every `packages/*\/CHANGELOG.md` into a single
 * `docs/reference/changelog.mdx` page. Intended to be run in CI after
 * `changeset version` bumps the packages — the resulting MDX is what the
 * docs site surfaces under Reference → Changelog.
 *
 * Idempotent: re-running with the same inputs produces byte-identical
 * output.
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const packagesDir = join(repoRoot, 'packages');
const outputPath = join(repoRoot, 'docs', 'reference', 'changelog.mdx');

async function readPackageChangelogs() {
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgJsonPath = join(packagesDir, entry.name, 'package.json');
    const changelogPath = join(packagesDir, entry.name, 'CHANGELOG.md');
    try {
      const pkg = JSON.parse(await readFile(pkgJsonPath, 'utf8'));
      if (pkg.private) continue;
      const md = await readFile(changelogPath, 'utf8').catch(() => '');
      if (!md.trim()) continue;
      out.push({ name: pkg.name, version: pkg.version ?? '0.0.0', md });
    } catch {
      // Package has no package.json or is otherwise malformed — skip.
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function renderMdx(changelogs) {
  const header = [
    "import { Meta } from '@storybook/addon-docs/blocks';",
    '',
    '<Meta title="Reference/Changelog" />',
    '',
    '# Changelog',
    '',
    '> Auto-generated from Changesets. One section per published',
    '> package. Rebuild with `node scripts/build-changelog-page.mjs`.',
    '',
  ].join('\n');

  const body = changelogs
    .map(({ name, md }) => {
      const firstHeaderStripped = md.replace(/^# .+\n+/, '');
      return `## ${name}\n\n${firstHeaderStripped.trim()}\n`;
    })
    .join('\n');

  if (!body) {
    return `${header}\n\n_No published packages have a CHANGELOG yet._\n`;
  }
  return `${header}\n${body}\n`;
}

async function main() {
  const changelogs = await readPackageChangelogs();
  const mdx = renderMdx(changelogs);
  await mkdir(dirname(outputPath), { recursive: true });

  let previous = '';
  try {
    previous = await readFile(outputPath, 'utf8');
  } catch {}

  if (previous === mdx) {
    // biome-ignore lint/suspicious/noConsole: CLI status output.
    console.log(`changelog.mdx is up to date (${changelogs.length} packages).`);
    return;
  }

  await writeFile(outputPath, mdx, 'utf8');
  // biome-ignore lint/suspicious/noConsole: CLI status output.
  console.log(
    `Wrote ${outputPath} (${changelogs.length} package${changelogs.length === 1 ? '' : 's'}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
