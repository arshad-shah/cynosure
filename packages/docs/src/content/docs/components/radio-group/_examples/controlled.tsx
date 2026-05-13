import { Radio, RadioGroup } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('light');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <RadioGroup value={value} onValueChange={setValue} aria-label="Theme">
        <Radio value="light">Light</Radio>
        <Radio value="dark">Dark</Radio>
        <Radio value="system">System</Radio>
      </RadioGroup>
      <span style={{ fontSize: '0.875rem', color: 'var(--c-fg-muted)' }}>Selected: {value}</span>
    </div>
  );
}
