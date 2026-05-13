import { NumberInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '240px' }}>
      <NumberInput
        aria-label="Currency"
        defaultValue={1299}
        formatOptions={{ style: 'currency', currency: 'USD' }}
      />
      <NumberInput
        aria-label="Percent"
        defaultValue={0.42}
        minValue={0}
        maxValue={1}
        step={0.01}
        formatOptions={{ style: 'percent' }}
      />
    </div>
  );
}
