import { NumberInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '220px' }}>
      <NumberInput
        aria-label="Budget"
        defaultValue={1280}
        minValue={0}
        prefix="$"
        clearOnLongPress
      />
    </div>
  );
}
