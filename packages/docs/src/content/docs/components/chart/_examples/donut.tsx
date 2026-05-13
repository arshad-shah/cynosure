import { DonutChart } from '@arshad-shah/cynosure-react/chart';

const data = [
  { channel: 'Direct', value: 38 },
  { channel: 'Search', value: 27 },
  { channel: 'Social', value: 18 },
  { channel: 'Email', value: 11 },
  { channel: 'Referral', value: 6 },
];

export default function Example() {
  return (
    <div style={{ width: '28rem', maxWidth: '100%' }}>
      <DonutChart
        data={data}
        mapping={{ labelField: 'channel', valueField: 'value' }}
        aspectRatio="1 / 1"
      />
    </div>
  );
}
