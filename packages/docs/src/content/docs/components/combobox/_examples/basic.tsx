import { Combobox } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

const languages = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'js', label: 'JavaScript' },
  { value: 'py', label: 'Python' },
  { value: 'rs', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'rb', label: 'Ruby' },
];

export default function Example() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '260px' }}>
      <Combobox
        aria-label="Programming language"
        items={languages}
        value={value}
        onValueChange={setValue}
        placeholder="Search languages…"
      />
      {value && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-fg-muted, #6b7280)', margin: 0 }}>
          Selected: {value}
        </p>
      )}
    </div>
  );
}
