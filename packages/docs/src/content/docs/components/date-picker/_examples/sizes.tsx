import { DatePicker, Stack } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  return (
    <Stack gap="3" style={{ width: 320 }}>
      <DatePicker label="Small" size="sm" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Medium" size="md" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Large" size="lg" defaultValue={parseDate('2026-04-17')} />
    </Stack>
  );
}
