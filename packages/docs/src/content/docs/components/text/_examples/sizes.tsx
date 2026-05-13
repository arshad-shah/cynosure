import { Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Text size="xs">Extra small body copy</Text>
      <Text size="sm">Small body copy</Text>
      <Text size="md">Medium body copy (default)</Text>
      <Text size="lg">Large body copy</Text>
      <Text size="xl">Extra large body copy</Text>
    </div>
  );
}
