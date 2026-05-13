import { DatePicker, Stack } from '@arshad-shah/cynosure-react';
import { parseDate } from '@internationalized/date';

export default function Example() {
  return (
    <Stack gap="3" style={{ width: 320 }}>
      <DatePicker label="Default" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Disabled" isDisabled defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Read only" isReadOnly defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Invalid" invalid defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Empty" aria-label="Empty date" />
    </Stack>
  );
}
