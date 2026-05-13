import { Spinner } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Spinner size="lg" speed="slow" colorScheme="accent" />
      <Spinner size="lg" speed="normal" colorScheme="accent" />
      <Spinner size="lg" speed="fast" colorScheme="accent" />
    </div>
  );
}
