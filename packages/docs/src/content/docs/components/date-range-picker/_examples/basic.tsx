import { DateRangePicker } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  return (
    <div style={{ width: 380 }}>
      <DateRangePicker
        label="Stay"
        defaultValue={{
          start: parseDate('2026-04-17'),
          end: parseDate('2026-04-22'),
        }}
      />
    </div>
  );
}
