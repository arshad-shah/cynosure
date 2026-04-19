import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type Framework = 'next-app' | 'next-pages' | 'vite' | 'cra' | 'remix' | 'unknown';

export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun';

export interface ProjectInfo {
  root: string;
  framework: Framework;
  packageManager: PackageManager;
  entryCandidates: string[];
  hasTypeScript: boolean;
}

const exists = async (p: string): Promise<boolean> => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

const detectFramework = async (root: string): Promise<Framework> => {
  if (await exists(join(root, 'next.config.js'))) return detectNextVariant(root);
  if (await exists(join(root, 'next.config.ts'))) return detectNextVariant(root);
  if (await exists(join(root, 'next.config.mjs'))) return detectNextVariant(root);
  if (await exists(join(root, 'remix.config.js'))) return 'remix';
  if (await exists(join(root, 'vite.config.ts'))) return 'vite';
  if (await exists(join(root, 'vite.config.js'))) return 'vite';
  if (await exists(join(root, 'vite.config.mjs'))) return 'vite';
  if (await exists(join(root, 'public/index.html'))) return 'cra';
  return 'unknown';
};

const detectNextVariant = async (root: string): Promise<'next-app' | 'next-pages'> => {
  if ((await exists(join(root, 'app'))) || (await exists(join(root, 'src/app')))) {
    return 'next-app';
  }
  return 'next-pages';
};

const detectPackageManager = async (root: string): Promise<PackageManager> => {
  if (await exists(join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await exists(join(root, 'yarn.lock'))) return 'yarn';
  if (await exists(join(root, 'bun.lockb'))) return 'bun';
  if (await exists(join(root, 'bun.lock'))) return 'bun';
  if (await exists(join(root, 'package-lock.json'))) return 'npm';
  return 'npm';
};

const entryCandidates = async (root: string, framework: Framework): Promise<string[]> => {
  const all: string[] = [];
  const push = async (rel: string) => {
    if (await exists(join(root, rel))) all.push(rel);
  };
  if (framework === 'next-app') {
    await push('app/layout.tsx');
    await push('app/layout.jsx');
    await push('src/app/layout.tsx');
    await push('src/app/layout.jsx');
  } else if (framework === 'next-pages') {
    await push('pages/_app.tsx');
    await push('pages/_app.jsx');
    await push('src/pages/_app.tsx');
    await push('src/pages/_app.jsx');
  } else if (framework === 'vite' || framework === 'cra') {
    await push('src/main.tsx');
    await push('src/main.jsx');
    await push('src/index.tsx');
    await push('src/index.jsx');
  } else if (framework === 'remix') {
    await push('app/root.tsx');
    await push('app/root.jsx');
  }
  return all;
};

export async function detectProject(root: string): Promise<ProjectInfo> {
  const framework = await detectFramework(root);
  const packageManager = await detectPackageManager(root);
  const entries = await entryCandidates(root, framework);
  const pkgPath = join(root, 'package.json');
  let hasTypeScript = false;
  if (await exists(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as Record<string, unknown>;
    const deps = {
      ...((pkg.dependencies as Record<string, string>) ?? {}),
      ...((pkg.devDependencies as Record<string, string>) ?? {}),
    };
    hasTypeScript = 'typescript' in deps;
  }
  return { root, framework, packageManager, entryCandidates: entries, hasTypeScript };
}

export function installCommand(pm: PackageManager, deps: string[]): string {
  const joined = deps.join(' ');
  switch (pm) {
    case 'pnpm':
      return `pnpm add ${joined}`;
    case 'yarn':
      return `yarn add ${joined}`;
    case 'bun':
      return `bun add ${joined}`;
    case 'npm':
      return `npm install ${joined}`;
  }
}
