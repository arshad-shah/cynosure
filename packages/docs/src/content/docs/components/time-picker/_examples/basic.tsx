import { TimePicker } from '@arshad-shah/cynosure-react';
import { Time } from '@internationalized/date';

export default function Example() {
  return (
    <div style={{ width: '240px' }}>
      <TimePicker aria-label="Meeting time" defaultValue={new Time(9, 30)} />
    </div>
  );
}
