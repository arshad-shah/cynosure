import { RangeSlider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
      <RangeSlider size="sm" label="Small" defaultValue={[20, 60]} />
      <RangeSlider size="md" label="Medium" defaultValue={[20, 60]} />
      <RangeSlider size="lg" label="Large" defaultValue={[20, 60]} />
    </div>
  );
}
