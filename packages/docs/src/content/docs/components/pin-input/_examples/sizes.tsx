import { PinInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PinInput length={4} size="sm" aria-label="Small" defaultValue="12" />
      <PinInput length={4} size="md" aria-label="Medium" defaultValue="12" />
      <PinInput length={4} size="lg" aria-label="Large" defaultValue="12" />
    </div>
  );
}
