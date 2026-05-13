import { Stat, StatHelp, StatLabel, StatValue } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stat>
      <StatLabel>Time to first byte</StatLabel>
      <StatValue>184 ms</StatValue>
      <StatHelp>p75 across all regions, last 24 hours</StatHelp>
    </Stat>
  );
}
