import { CircularProgress } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <CircularProgress indeterminate size="md" aria-label="Loading" />
      <CircularProgress indeterminate size="lg" colorScheme="success" aria-label="Loading" />
    </div>
  );
}
