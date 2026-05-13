import { DatePicker, Stack } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  return (
    <Stack gap="3" style={{ width: 320 }}>
      <DatePicker label="Outline" variant="outline" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Filled" variant="filled" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Ghost" variant="ghost" defaultValue={parseDate('2026-04-17')} />
    </Stack>
  );
}
