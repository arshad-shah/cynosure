import { Slider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
      <Slider
        label="Price"
        defaultValue={499}
        minValue={0}
        maxValue={1000}
        step={10}
        showValue
        formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      />
      <Slider
        label="Opacity"
        defaultValue={0.6}
        minValue={0}
        maxValue={1}
        step={0.01}
        showValue
        formatOptions={{ style: 'percent' }}
      />
    </div>
  );
}
