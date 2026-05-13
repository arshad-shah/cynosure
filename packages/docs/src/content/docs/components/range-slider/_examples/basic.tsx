import { RangeSlider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <RangeSlider
        label="Price range"
        defaultValue={[20, 80]}
        minValue={0}
        maxValue={100}
        showValue
      />
    </div>
  );
}
