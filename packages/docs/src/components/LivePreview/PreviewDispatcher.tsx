import type { ComponentType } from 'react';

type ExampleModule = { default: ComponentType };

const modules = import.meta.glob<ExampleModule>(
  '../../content/docs/components/**/_examples/*.tsx',
  { eager: true },
);

const bySlug = new Map<string, ComponentType>();
for (const [key, mod] of Object.entries(modules)) {
  const m = key.match(/components\/([^/]+)\/_examples\/([^.]+)\.tsx$/);
  if (!m) continue;
  bySlug.set(`${m[1]}/${m[2]}`, mod.default);
}

export interface PreviewDispatcherProps {
  slug: string;
}

export default function PreviewDispatcher({ slug }: PreviewDispatcherProps) {
  const Component = bySlug.get(slug);
  if (!Component) {
    return <div>Preview not found: {slug}</div>;
  }
  return <Component />;
}
