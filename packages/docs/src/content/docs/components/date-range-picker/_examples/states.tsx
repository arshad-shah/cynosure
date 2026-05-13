import { DateRangePicker, Stack } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  const range = {
    start: parseDate('2026-04-17'),
    end: parseDate('2026-04-22'),
  };
  return (
    <Stack gap="3" style={{ width: 380 }}>
      <DateRangePicker label="Default" defaultValue={range} />
      <DateRangePicker label="Disabled" isDisabled defaultValue={range} />
      <DateRangePicker label="Read only" isReadOnly defaultValue={range} />
      <DateRangePicker label="Invalid" invalid defaultValue={range} />
      <DateRangePicker label="Empty" aria-label="Empty range" />
    </Stack>
  );
}
