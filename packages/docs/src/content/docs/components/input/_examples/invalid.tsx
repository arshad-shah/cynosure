import { Input } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('bad-email');
  const invalid = value.length > 0 && !value.includes('@');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '320px' }}>
      <Input
        type="email"
        value={value}
        onChange={setValue}
        invalid={invalid}
        placeholder="you@example.com"
      />
      {invalid && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-danger-600, #dc2626)', margin: 0 }}>
          Enter a valid email address.
        </p>
      )}
    </div>
  );
}
