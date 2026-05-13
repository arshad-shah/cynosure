import { LineChart } from '@arshad-shah/cynosure-react/chart';

const data = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 1600 },
  { month: 'Mar', revenue: 2100 },
  { month: 'Apr', revenue: 1900 },
  { month: 'May', revenue: 2500 },
  { month: 'Jun', revenue: 3000 },
];

export default function Example() {
  return (
    <div style={{ width: '36rem', maxWidth: '100%' }}>
      <LineChart
        data={data}
        mapping={{ x: 'month', y: ['revenue'], seriesNames: ['Revenue'] }}
        smooth
        dots
        aspectRatio="16 / 9"
      />
    </div>
  );
}
