import { Tag } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Tag size="xs">Extra small</Tag>
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
    </div>
  );
}
