import { Slider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <Slider label="Locked" defaultValue={40} isDisabled showValue />
    </div>
  );
}
