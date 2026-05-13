import { Calendar } from '@arshad-shah/cynosure-react/calendar';
import { type CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState<CalendarDate | null>(today(getLocalTimeZone()));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Calendar aria-label="Event date" value={value} onChange={setValue} />
      <p style={{ fontSize: '0.875rem', color: 'var(--cynosure-color-fg-muted)' }}>
        Selected: {value?.toString() ?? 'none'}
      </p>
    </div>
  );
}
