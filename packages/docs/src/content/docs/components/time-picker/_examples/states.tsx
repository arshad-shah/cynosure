import { TimePicker } from '@arshad-shah/cynosure-react';
import { Time } from '@internationalized/date';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '240px' }}>
      <TimePicker aria-label="Default" defaultValue={new Time(9, 0)} />
      <TimePicker aria-label="Invalid" defaultValue={new Time(9, 0)} invalid />
      <TimePicker aria-label="Read-only" defaultValue={new Time(9, 0)} isReadOnly />
      <TimePicker aria-label="Disabled" defaultValue={new Time(9, 0)} isDisabled />
    </div>
  );
}
