import { Radio, RadioGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <RadioGroup defaultValue="pro" aria-label="Subscription plan">
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team">Team</Radio>
    </RadioGroup>
  );
}
