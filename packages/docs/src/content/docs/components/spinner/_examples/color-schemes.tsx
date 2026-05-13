import { Spinner } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Spinner size="lg" colorScheme="accent" />
      <Spinner size="lg" colorScheme="neutral" />
      <span style={{ color: 'var(--cynosure-color-success-solid)' }}>
        <Spinner size="lg" colorScheme="currentColor" />
      </span>
    </div>
  );
}
