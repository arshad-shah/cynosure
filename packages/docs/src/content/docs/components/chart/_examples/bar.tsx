import { BarChart } from '@arshad-shah/cynosure-react/chart';

const data = [
  { quarter: 'Q1', revenue: 4200, cost: 2400 },
  { quarter: 'Q2', revenue: 5600, cost: 2900 },
  { quarter: 'Q3', revenue: 6100, cost: 3100 },
  { quarter: 'Q4', revenue: 7300, cost: 3500 },
];

export default function Example() {
  return (
    <div style={{ width: '36rem', maxWidth: '100%' }}>
      <BarChart
        data={data}
        mapping={{ x: 'quarter', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
        aspectRatio="16 / 9"
      />
    </div>
  );
}
