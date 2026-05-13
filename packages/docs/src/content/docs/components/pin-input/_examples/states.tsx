import { PinInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PinInput length={4} aria-label="Default" defaultValue="12" />
      <PinInput length={4} aria-label="Invalid" defaultValue="12" invalid />
      <PinInput length={4} aria-label="Disabled" defaultValue="1234" disabled />
    </div>
  );
}
