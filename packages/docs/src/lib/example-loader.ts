import type { ComponentType } from 'react';

type ExampleModule = { default: ComponentType };

const modules = import.meta.glob<ExampleModule>('../content/docs/components/**/_examples/*.tsx', {
  eager: true,
});
const sources = import.meta.glob<string>('../content/docs/components/**/_examples/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export interface Example {
  component: ComponentType;
  source: string;
  slug: string;
}

function keyToSlug(key: string): string {
  const m = key.match(/components\/([^/]+)\/_examples\/([^.]+)\.tsx$/);
  if (!m) throw new Error(`Unexpected example path: ${key}`);
  return `${m[1]}/${m[2]}`;
}

const bySlug = new Map<string, Example>();
for (const [key, mod] of Object.entries(modules)) {
  const source = sources[key];
  if (!source) throw new Error(`Missing raw source for ${key}`);
  const slug = keyToSlug(key);
  bySlug.set(slug, { component: mod.default, source, slug });
}

export function getExample(slug: string): Example {
  const ex = bySlug.get(slug);
  if (!ex) {
    throw new Error(`Example not found: ${slug}. Available: ${[...bySlug.keys()].join(', ')}`);
  }
  return ex;
}

export function listExamples(componentSlug: string): Example[] {
  return [...bySlug.values()].filter((e) => e.slug.startsWith(`${componentSlug}/`));
}
