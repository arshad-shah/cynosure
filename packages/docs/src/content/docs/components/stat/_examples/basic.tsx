import { Stat, StatHelp, StatLabel, StatValue } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stat>
      <StatLabel>Monthly revenue</StatLabel>
      <StatValue>$48,290</StatValue>
      <StatHelp>Up from $42,960 last month</StatHelp>
    </Stat>
  );
}
