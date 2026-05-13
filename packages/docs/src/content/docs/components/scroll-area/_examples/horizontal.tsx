import { ScrollArea } from '@arshad-shah/cynosure-react';

const tags = [
  'design',
  'accessibility',
  'tokens',
  'typography',
  'components',
  'react',
  'vanilla-extract',
  'radix-ui',
  'storybook',
  'astro',
];

export default function Example() {
  return (
    <ScrollArea
      width={360}
      height={64}
      scrollbars="horizontal"
      style={{
        border: '1px solid var(--cynosure-color-border)',
        borderRadius: 'var(--cynosure-radius-md)',
      }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', width: 'max-content' }}>
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '0.25rem 0.625rem',
              border: '1px solid var(--cynosure-color-border)',
              borderRadius: 'var(--cynosure-radius-full)',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
            }}
          >
            #{tag}
          </span>
        ))}
      </div>
    </ScrollArea>
  );
}
