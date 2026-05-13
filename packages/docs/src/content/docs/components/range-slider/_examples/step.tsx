import { RangeSlider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <RangeSlider
        label="Volume window"
        defaultValue={[10, 30]}
        minValue={0}
        maxValue={50}
        step={5}
        showValue
      />
    </div>
  );
}
