import { Calendar } from '@arshad-shah/cynosure-react/calendar';
import { type CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
import { useState } from 'react';

export default function Example() {
  const tz = getLocalTimeZone();
  const [focused, setFocused] = useState<CalendarDate | undefined>(undefined);
  return (
    <Calendar
      aria-label="Event date"
      focusedValue={focused}
      onFocusChange={setFocused}
      footer={
        <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setFocused(today(tz))}
            style={{
              fontSize: '0.875rem',
              background: 'transparent',
              border: 0,
              color: 'var(--cynosure-color-accent-solid)',
              cursor: 'pointer',
            }}
          >
            Go to today
          </button>
        </div>
      }
    />
  );
}
