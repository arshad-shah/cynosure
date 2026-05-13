import { ScrollArea } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ScrollArea
      width={320}
      height={180}
      type="always"
      scrollbars="vertical"
      style={{
        border: '1px solid var(--cynosure-color-border)',
        borderRadius: 'var(--cynosure-radius-md)',
      }}
    >
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: 30 }, (_, i) => {
          const id = (i + 1).toString().padStart(2, '0');
          return (
            <div key={`row-${id}`} style={{ fontSize: '0.875rem' }}>
              Always-visible scrollbar row #{id}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
