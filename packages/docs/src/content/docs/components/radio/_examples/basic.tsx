import { Radio, RadioGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <RadioGroup defaultValue="b" aria-label="Choose an option">
      <Radio value="a">Option A</Radio>
      <Radio value="b">Option B</Radio>
      <Radio value="c">Option C</Radio>
    </RadioGroup>
  );
}
