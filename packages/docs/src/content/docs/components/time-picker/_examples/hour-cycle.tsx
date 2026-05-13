import { TimePicker } from '@arshad-shah/cynosure-react';
import { Time } from '@internationalized/date';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '240px' }}>
      <TimePicker aria-label="12-hour" hourCycle={12} defaultValue={new Time(14, 30)} />
      <TimePicker aria-label="24-hour" hourCycle={24} defaultValue={new Time(14, 30)} />
    </div>
  );
}
