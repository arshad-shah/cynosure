import { Input } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '320px' }}>
      <Input placeholder="Disabled" disabled />
      <Input defaultValue="Read-only content" readOnly />
    </div>
  );
}
