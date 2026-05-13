import { PinInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PinInput length={4} aria-label="4-digit PIN" defaultValue="1234" />
      <PinInput length={6} aria-label="6-digit OTP" defaultValue="123456" />
    </div>
  );
}
