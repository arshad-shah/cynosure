import { NumberInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '200px' }}>
      <NumberInput aria-label="Quantity" defaultValue={1} minValue={0} maxValue={10} />
    </div>
  );
}
