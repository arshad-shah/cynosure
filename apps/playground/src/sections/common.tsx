import type { ReactNode } from 'react';

export function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="showcase-card">
      <h3>{title}</h3>
      <div className="demo">{children}</div>
    </div>
  );
}

export function DemoCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="showcase-card">
      <h3>{title}</h3>
      <div className="demo-col">{children}</div>
    </div>
  );
}

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="showcase-section-header">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
