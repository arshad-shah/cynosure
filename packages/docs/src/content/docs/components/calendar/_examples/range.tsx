import { RangeCalendar } from '@arshad-shah/cynosure-react/calendar';
import { parseDate } from '@internationalized/date';

export default function Example() {
  return (
    <RangeCalendar
      aria-label="Trip dates"
      defaultValue={{
        start: parseDate('2026-04-12'),
        end: parseDate('2026-04-18'),
      }}
    />
  );
}
