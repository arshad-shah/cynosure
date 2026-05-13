import { Slider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
      <Slider label="By 5" defaultValue={25} minValue={0} maxValue={100} step={5} showValue />
      <Slider label="Decimal" defaultValue={0.5} minValue={0} maxValue={1} step={0.05} showValue />
    </div>
  );
}
