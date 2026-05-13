import { RangeSlider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
      <RangeSlider
        label="Price (USD)"
        defaultValue={[250, 750]}
        minValue={0}
        maxValue={1000}
        step={10}
        showValue
        formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      />
      <RangeSlider
        label="Opacity"
        defaultValue={[0.2, 0.8]}
        minValue={0}
        maxValue={1}
        step={0.05}
        showValue
        formatOptions={{ style: 'percent' }}
      />
    </div>
  );
}
