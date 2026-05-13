import { DatePicker } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  return (
    <div style={{ width: 320 }}>
      <DatePicker label="Start date" defaultValue={parseDate('2026-04-17')} />
    </div>
  );
}
