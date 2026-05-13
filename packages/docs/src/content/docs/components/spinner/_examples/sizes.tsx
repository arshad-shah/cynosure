import { Spinner } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
      <Spinner size="xs" colorScheme="accent" />
      <Spinner size="sm" colorScheme="accent" />
      <Spinner size="md" colorScheme="accent" />
      <Spinner size="lg" colorScheme="accent" />
      <Spinner size="xl" colorScheme="accent" />
    </div>
  );
}
