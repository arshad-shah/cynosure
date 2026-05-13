import { NumberInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '200px' }}>
      <NumberInput aria-label="0–100" defaultValue={25} minValue={0} maxValue={100} step={5} />
      <NumberInput aria-label="Decimal" defaultValue={1.5} step={0.1} minValue={0} maxValue={5} />
    </div>
  );
}
