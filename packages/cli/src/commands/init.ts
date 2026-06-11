import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { type ProjectInfo, detectProject, installCommand } from '../utils/detect.js';
import { c, log } from '../utils/logger.js';

export interface InitOptions {
  cwd?: string;
  yes?: boolean;
  dryRun?: boolean;
}

const DEPENDENCIES = ['@arshad-shah/cynosure-react', '@arshad-shah/cynosure-tokens'];

export async function init(options: InitOptions = {}): Promise<number> {
  const root = options.cwd ?? process.cwd();

  log.step('Cynosure UI — init');
  log.info(`Scanning ${c.dim(root)}…`);

  const project = await detectProject(root);

  log.plain(`  framework: ${c.bold(project.framework)}`);
  log.plain(`  package manager: ${c.bold(project.packageManager)}`);
  log.plain(`  TypeScript: ${project.hasTypeScript ? c.green('yes') : c.yellow('no')}`);

  if (project.framework === 'unknown') {
    log.warn(
      'Could not detect your framework. Run this from the root of a Next.js, Vite, CRA, or Remix project.',
    );
    printManualSteps(project);
    return 1;
  }

  if (project.entryCandidates.length === 0) {
    log.warn('No entry file found. Falling back to manual instructions.');
    printManualSteps(project);
    return 1;
  }

  log.step('1. Install');
  log.plain(`  ${c.cyan(installCommand(project.packageManager, DEPENDENCIES))}`);

  log.step('2. Wire up the provider');
  const entry = project.entryCandidates[0];
  if (!entry) {
    log.warn('No entry file found.');
    printManualSteps(project);
    return 1;
  }
  const entryPath = join(project.root, entry);
  const original = await readFile(entryPath, 'utf8');
  const patched = patchEntry(original, project.framework);

  // For Next.js App Router, also create a co-located `providers.tsx` — the
  // canonical client boundary where CynosureProvider lives.
  let providersPath: string | null = null;
  let providersContent: string | null = null;
  if (project.framework === 'next-app') {
    const layoutDir = dirname(entryPath);
    const ext = entry.endsWith('.tsx') ? '.tsx' : '.jsx';
    providersPath = join(layoutDir, `providers${ext}`);
    if (!(await fileExists(providersPath))) {
      providersContent = renderProvidersFile();
    }
  }

  if (patched === original && !providersContent) {
    log.success(`${entry} already wired up — nothing to do.`);
  } else if (options.dryRun) {
    if (patched !== original) {
      log.info(`Would update ${c.bold(entry)}:`);
      log.plain(diffPreview(original, patched));
    }
    if (providersContent && providersPath) {
      log.info(`Would create ${c.bold(relative(root, providersPath))}`);
    }
  } else {
    if (patched !== original) {
      await writeFile(entryPath, patched, 'utf8');
      log.success(`Updated ${c.bold(relative(root, entryPath))}`);
    }
    if (providersContent && providersPath) {
      await writeFile(providersPath, providersContent, 'utf8');
      log.success(`Created ${c.bold(relative(root, providersPath))}`);
    }
  }

  log.step('3. Next steps');
  log.hint('Start your dev server and import components from their subpaths:');
  log.plain(
    c.dim(
      `    import { Button } from '@arshad-shah/cynosure-react/button';\n    <Button>Hello</Button>`,
    ),
  );
  log.plain('');
  log.hint('Docs: https://github.com/arshad-shah/cynosure');

  return 0;
}

function patchEntry(source: string, framework: ProjectInfo['framework']): string {
  let next = source;

  // No CSS import needed: `CynosureProvider` loads the design tokens itself, and
  // each component's CSS auto-loads when imported. We only wire up the provider.
  if (framework === 'next-app') {
    next = addNextAppProviders(next);
  } else if (!next.includes('CynosureProvider')) {
    next = addCynosureProvider(next, framework);
  }

  return next;
}

function addNextAppProviders(source: string): string {
  let next = source;
  if (!next.includes("from './providers'") && !next.includes('from "./providers"')) {
    next = prependImport(next, "import { Providers } from './providers';");
  }
  next = next.replace(
    /(<body[^>]*>)([\s\S]*?)(<\/body>)/,
    (match, open: string, inner: string, close: string) => {
      if (inner.includes('<Providers')) return match;
      return `${open}\n        <Providers>${inner}</Providers>\n      ${close}`;
    },
  );
  return next;
}

function renderProvidersFile(): string {
  return `'use client';
import { CynosureProvider } from '@arshad-shah/cynosure-react';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <CynosureProvider>{children}</CynosureProvider>;
}
`;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function prependImport(source: string, line: string): string {
  const lines = source.split('\n');
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (raw === undefined) continue;
    const trimmed = raw.trim();
    if (trimmed.startsWith('import ')) lastImportIndex = i;
    else if (trimmed.startsWith("'use client'") || trimmed.startsWith('"use client"')) continue;
    else if (trimmed === '' || trimmed.startsWith('//')) continue;
    else break;
  }
  if (lastImportIndex === -1) {
    return `${line}\n\n${source}`;
  }
  lines.splice(lastImportIndex + 1, 0, line);
  return lines.join('\n');
}

function addCynosureProvider(source: string, framework: ProjectInfo['framework']): string {
  const providerImport = "import { CynosureProvider } from '@arshad-shah/cynosure-react';";
  let next = source;
  if (!next.includes("from '@arshad-shah/cynosure-react'")) {
    next = prependImport(next, providerImport);
  } else if (!next.includes('CynosureProvider')) {
    next = next.replace(/from '@arshad-shah\/cynosure-react'/, (match) =>
      match.replace('{', '{ CynosureProvider, ').replace('{  ', '{ '),
    );
  }

  // Only auto-wrap for Next.js App Router layouts where <html><body>{children}</body></html>
  // is the canonical structure. For every other framework we leave the JSX
  // alone and only add the import — the user wraps their root where they see fit.
  if (framework === 'next-app') {
    next = next.replace(
      /(<body[^>]*>)([\s\S]*?)(<\/body>)/,
      (_match, open: string, inner: string, close: string) => {
        if (inner.includes('CynosureProvider')) return _match;
        return `${open}\n        <CynosureProvider>${inner}</CynosureProvider>\n      ${close}`;
      },
    );
  }

  return next;
}

function diffPreview(before: string, after: string): string {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const added = afterLines.filter((line, i) => line !== beforeLines[i]);
  return added
    .slice(0, 10)
    .map((line) => `    ${c.green('+')} ${line}`)
    .join('\n');
}

function printManualSteps(project: ProjectInfo) {
  log.step('Manual setup');
  log.plain(`  1. ${c.cyan(installCommand(project.packageManager, DEPENDENCIES))}`);
  log.plain('  2. Wrap your root component (this also loads the design tokens):');
  log.plain(
    c.dim(
      `       import { CynosureProvider } from '@arshad-shah/cynosure-react';\n       <CynosureProvider>{children}</CynosureProvider>`,
    ),
  );
  log.plain('  3. Import components from their subpaths:');
  log.plain(c.dim(`       import { Button } from '@arshad-shah/cynosure-react/button';`));
}
