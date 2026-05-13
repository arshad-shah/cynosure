import { Stat, StatArrow, StatHelp, StatLabel, StatValue } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '1rem',
      }}
    >
      <Stat>
        <StatLabel>Revenue</StatLabel>
        <StatValue>$48,290</StatValue>
        <StatHelp>
          <StatArrow direction="increase" /> 12.4%
        </StatHelp>
      </Stat>
      <Stat>
        <StatLabel>Active users</StatLabel>
        <StatValue>9,820</StatValue>
        <StatHelp>
          <StatArrow direction="increase" /> 3.1%
        </StatHelp>
      </Stat>
      <Stat>
        <StatLabel>Churn</StatLabel>
        <StatValue>2.1%</StatValue>
        <StatHelp>
          <StatArrow direction="decrease" /> 0.4%
        </StatHelp>
      </Stat>
    </div>
  );
}
