import { Slider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
      <Slider size="sm" label="Small" defaultValue={30} />
      <Slider size="md" label="Medium" defaultValue={50} />
      <Slider size="lg" label="Large" defaultValue={70} />
    </div>
  );
}
