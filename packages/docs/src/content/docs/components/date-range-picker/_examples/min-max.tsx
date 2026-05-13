import { DateRangePicker } from '@arshad-shah/cynosure-react';
import { getLocalTimeZone, today } from '@internationalized/date';

export default function Example() {
  const TODAY = today(getLocalTimeZone());
  return (
    <div style={{ width: 380 }}>
      <DateRangePicker
        label="Future bookings only"
        minValue={TODAY}
        defaultValue={{
          start: TODAY.add({ days: 1 }),
          end: TODAY.add({ days: 5 }),
        }}
      />
    </div>
  );
}
