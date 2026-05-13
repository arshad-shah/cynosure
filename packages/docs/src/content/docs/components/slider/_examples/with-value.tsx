import { Slider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <Slider label="Brightness" defaultValue={64} minValue={0} maxValue={100} showValue />
    </div>
  );
}
