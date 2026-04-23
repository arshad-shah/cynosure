import { Checkbox, CheckboxGroup } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [selected, setSelected] = useState<string[]>(['react']);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <CheckboxGroup value={selected} onChange={setSelected} aria-label="Preferred frameworks">
        <Checkbox value="react">React</Checkbox>
        <Checkbox value="vue">Vue</Checkbox>
        <Checkbox value="svelte">Svelte</Checkbox>
        <Checkbox value="solid">Solid</Checkbox>
      </CheckboxGroup>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-fg-muted, #6b7280)', margin: 0 }}>
        Selected: {selected.length > 0 ? selected.join(', ') : 'none'}
      </p>
    </div>
  );
}
