import { RangeSlider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <RangeSlider label="Locked range" defaultValue={[30, 70]} isDisabled showValue />
    </div>
  );
}
