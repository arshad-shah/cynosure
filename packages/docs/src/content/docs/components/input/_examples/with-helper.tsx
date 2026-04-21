import { Input } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '320px' }}>
      <label htmlFor="username" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
        Username
      </label>
      <Input id="username" value={value} onChange={setValue} placeholder="arshad_shah" />
      <p style={{ fontSize: '0.75rem', color: 'var(--color-fg-muted, #6b7280)', margin: 0 }}>
        Only letters, numbers, and underscores. 3–20 characters.
      </p>
    </div>
  );
}
