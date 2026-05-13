import { TimePicker } from '@arshad-shah/cynosure-react';
import { Time } from '@internationalized/date';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState<Time | null>(new Time(8, 0));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '240px' }}>
      <TimePicker
        aria-label="Start time"
        value={value}
        onChange={(t) => setValue(t as Time | null)}
      />
      <span style={{ fontSize: '0.875rem', color: 'var(--c-fg-muted)' }}>
        Selected: {value ? value.toString() : '(none)'}
      </span>
    </div>
  );
}
