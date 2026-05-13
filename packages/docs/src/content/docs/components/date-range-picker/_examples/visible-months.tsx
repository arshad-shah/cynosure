import { DateRangePicker, Stack } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  const range = {
    start: parseDate('2026-04-17'),
    end: parseDate('2026-04-22'),
  };
  return (
    <Stack gap="3" style={{ width: 380 }}>
      <DateRangePicker label="One month" visibleMonths={1} defaultValue={range} />
      <DateRangePicker label="Two months" visibleMonths={2} defaultValue={range} />
    </Stack>
  );
}
