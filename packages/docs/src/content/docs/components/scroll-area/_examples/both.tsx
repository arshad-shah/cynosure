import { ScrollArea } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ScrollArea
      width={320}
      height={220}
      scrollbars="both"
      style={{
        border: '1px solid var(--cynosure-color-border)',
        borderRadius: 'var(--cynosure-radius-md)',
      }}
    >
      <div style={{ padding: '0.75rem', width: 560 }}>
        {Array.from({ length: 24 }, (_, i) => {
          const id = (i + 1).toString().padStart(2, '0');
          return (
            <p key={`row-${id}`} style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
              Row {id} — this paragraph is wide enough to force horizontal scrolling alongside the
              vertical axis.
            </p>
          );
        })}
      </div>
    </ScrollArea>
  );
}
