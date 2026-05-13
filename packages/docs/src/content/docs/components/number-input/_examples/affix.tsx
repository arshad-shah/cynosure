import { NumberInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '240px' }}>
      <NumberInput aria-label="Price" defaultValue={9.99} prefix="$" minValue={0} step={0.01} />
      <NumberInput aria-label="Weight" defaultValue={70} suffix="kg" minValue={0} />
      <NumberInput aria-label="Discount" defaultValue={20} suffix="%" minValue={0} maxValue={100} />
    </div>
  );
}
