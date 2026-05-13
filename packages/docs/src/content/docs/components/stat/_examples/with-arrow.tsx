import { Stat, StatArrow, StatHelp, StatLabel, StatValue } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <Stat>
        <StatLabel>New signups</StatLabel>
        <StatValue>1,482</StatValue>
        <StatHelp>
          <StatArrow direction="increase" /> 23.4% vs last week
        </StatHelp>
      </Stat>
      <Stat>
        <StatLabel>Bounce rate</StatLabel>
        <StatValue>38.2%</StatValue>
        <StatHelp>
          <StatArrow direction="decrease" /> 4.1% vs last week
        </StatHelp>
      </Stat>
    </div>
  );
}
