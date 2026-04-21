import { Select } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

const options = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function Example() {
  const [value, setValue] = useState<string | null>(null);
  const invalid = value === null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '240px' }}>
      <Select
        aria-label="Frequency"
        items={options}
        value={value}
        onValueChange={setValue}
        invalid={invalid}
        placeholder="Select frequency…"
      />
      {invalid && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-danger-600, #dc2626)', margin: 0 }}>
          Please select a frequency.
        </p>
      )}
    </div>
  );
}
