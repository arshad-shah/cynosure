import { PinInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PinInput length={4} type="numeric" aria-label="Numeric" defaultValue="1234" />
      <PinInput length={4} type="alphanumeric" aria-label="Alphanumeric" defaultValue="aB7x" />
      <PinInput length={4} type="alphabetic" aria-label="Alphabetic" defaultValue="abcd" />
    </div>
  );
}
