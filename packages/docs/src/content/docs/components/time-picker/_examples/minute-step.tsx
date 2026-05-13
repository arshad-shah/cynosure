import { TimePicker } from '@arshad-shah/cynosure-react';
import { Time } from '@internationalized/date';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '240px' }}>
      <TimePicker aria-label="Every 5 minutes" minuteStep={5} defaultValue={new Time(10, 0)} />
      <TimePicker aria-label="Every 15 minutes" minuteStep={15} defaultValue={new Time(10, 0)} />
    </div>
  );
}
