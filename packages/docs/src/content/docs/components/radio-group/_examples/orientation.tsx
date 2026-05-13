import { Radio, RadioGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <RadioGroup defaultValue="m" orientation="horizontal" aria-label="Size">
        <Radio value="s">S</Radio>
        <Radio value="m">M</Radio>
        <Radio value="l">L</Radio>
        <Radio value="xl">XL</Radio>
      </RadioGroup>
      <RadioGroup defaultValue="standard" orientation="vertical" aria-label="Shipping">
        <Radio value="standard">Standard (3–5 days)</Radio>
        <Radio value="express">Express (1–2 days)</Radio>
        <Radio value="overnight">Overnight</Radio>
      </RadioGroup>
    </div>
  );
}
