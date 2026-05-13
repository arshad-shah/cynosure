import { AreaChart } from '@arshad-shah/cynosure-react/chart';

const data = [
  { week: 'W1', visits: 820 },
  { week: 'W2', visits: 1040 },
  { week: 'W3', visits: 1380 },
  { week: 'W4', visits: 1290 },
  { week: 'W5', visits: 1620 },
  { week: 'W6', visits: 1890 },
];

export default function Example() {
  return (
    <div style={{ width: '36rem', maxWidth: '100%' }}>
      <AreaChart
        data={data}
        mapping={{ x: 'week', y: 'visits', seriesNames: ['Visits'] }}
        smooth
        aspectRatio="16 / 9"
      />
    </div>
  );
}
