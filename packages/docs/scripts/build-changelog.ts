// NOTE: This file is regenerated on every build from packages/react/CHANGELOG.md.
// An initial committed version is included so the dev server works without running
// the build script first. Future builds overwrite it.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../../react/CHANGELOG.md');
const OUT = resolve(__dirname, '../src/content/docs/changelog.mdx');

const body = await readFile(SRC, 'utf8');
const frontmatter = `---
title: Changelog
description: Release notes for @arshad-shah/cynosure-react.
order: 100
category: changelog
---

`;
await writeFile(OUT, frontmatter + body, 'utf8');
console.log(`Wrote ${OUT}`);
