import { DateRangePicker } from '@arshad-shah/cynosure-react';
import { getLocalTimeZone, today } from '@internationalized/date';

export default function Example() {
  const TODAY = today(getLocalTimeZone());
  return (
    <div style={{ width: 420 }}>
      <DateRangePicker
        label="Report range"
        presets={[
          {
            label: 'Last 7 days',
            value: { start: TODAY.subtract({ days: 6 }), end: TODAY },
          },
          {
            label: 'Last 30 days',
            value: { start: TODAY.subtract({ days: 29 }), end: TODAY },
          },
          {
            label: 'This month',
            value: {
              start: TODAY.set({ day: 1 }),
              end: TODAY,
            },
          },
        ]}
      />
    </div>
  );
}
