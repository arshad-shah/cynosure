import { NumberInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '200px' }}>
      <NumberInput aria-label="Small" size="sm" defaultValue={3} />
      <NumberInput aria-label="Medium" size="md" defaultValue={3} />
      <NumberInput aria-label="Large" size="lg" defaultValue={3} />
    </div>
  );
}
