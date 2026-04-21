import { Select } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

export default function Example() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '240px' }}>
      <Select
        aria-label="Favourite fruit"
        items={fruits}
        value={value}
        onValueChange={setValue}
        placeholder="Pick a fruit…"
      />
      {value && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-fg-muted, #6b7280)', margin: 0 }}>
          Selected: {value}
        </p>
      )}
    </div>
  );
}
