import { Spinner } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Spinner variant="border" size="lg" colorScheme="accent" />
      <Spinner variant="dots" size="lg" colorScheme="accent" />
      <Spinner variant="ring" size="lg" colorScheme="accent" />
    </div>
  );
}
