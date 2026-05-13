import { DateRangePicker, Stack } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  const range = {
    start: parseDate('2026-04-17'),
    end: parseDate('2026-04-22'),
  };
  return (
    <Stack gap="3" style={{ width: 380 }}>
      <DateRangePicker label="Outline" variant="outline" defaultValue={range} />
      <DateRangePicker label="Filled" variant="filled" defaultValue={range} />
      <DateRangePicker label="Ghost" variant="ghost" defaultValue={range} />
    </Stack>
  );
}
