import { Slider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <Slider
        label="Tier"
        defaultValue={50}
        minValue={0}
        maxValue={100}
        step={25}
        showValue
        marks={[
          { value: 0, label: 'Free' },
          { value: 25, label: 'Hobby' },
          { value: 50, label: 'Pro' },
          { value: 75, label: 'Team' },
          { value: 100, label: 'Ent' },
        ]}
      />
    </div>
  );
}
