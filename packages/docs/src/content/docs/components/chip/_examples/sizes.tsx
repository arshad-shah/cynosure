import { Chip } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Chip size="xs">Extra small</Chip>
      <Chip size="sm">Small</Chip>
      <Chip size="md">Medium</Chip>
    </div>
  );
}
