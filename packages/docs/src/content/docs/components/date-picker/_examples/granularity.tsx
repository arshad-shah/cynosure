import { DatePicker, Stack } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  return (
    <Stack gap="3" style={{ width: 360 }}>
      <DatePicker label="Day precision" granularity="day" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Minute precision" granularity="minute" />
    </Stack>
  );
}
