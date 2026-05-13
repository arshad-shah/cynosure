import { Slider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <Slider label="Volume" defaultValue={50} minValue={0} maxValue={100} showValue />
    </div>
  );
}
