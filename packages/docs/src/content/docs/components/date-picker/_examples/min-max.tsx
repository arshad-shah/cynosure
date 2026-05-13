import { DatePicker } from '@arshad-shah/cynosure-react';
import { getLocalTimeZone, today } from '@internationalized/date';

export default function Example() {
  const tz = getLocalTimeZone();
  const TODAY = today(tz);
  return (
    <div style={{ width: 320 }}>
      <DatePicker
        label="Must fall within the next 30 days"
        minValue={TODAY}
        maxValue={TODAY.add({ days: 30 })}
        defaultValue={TODAY.add({ days: 7 })}
      />
    </div>
  );
}
