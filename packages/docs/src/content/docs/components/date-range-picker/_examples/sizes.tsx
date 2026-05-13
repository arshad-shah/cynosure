import { DateRangePicker, Stack } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  const range = {
    start: parseDate('2026-04-17'),
    end: parseDate('2026-04-22'),
  };
  return (
    <Stack gap="3" style={{ width: 380 }}>
      <DateRangePicker label="Small" size="sm" defaultValue={range} />
      <DateRangePicker label="Medium" size="md" defaultValue={range} />
      <DateRangePicker label="Large" size="lg" defaultValue={range} />
    </Stack>
  );
}
