import { RangeSlider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <RangeSlider
        label="Budget"
        defaultValue={[200, 800]}
        minValue={0}
        maxValue={1000}
        step={50}
        showValue
      />
    </div>
  );
}
