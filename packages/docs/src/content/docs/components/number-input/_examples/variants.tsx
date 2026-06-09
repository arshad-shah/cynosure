import { NumberInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '220px' }}>
      <NumberInput aria-label="Outline" variant="outline" defaultValue={1} />
      <NumberInput aria-label="Filled" variant="filled" defaultValue={1} />
      <NumberInput aria-label="Ghost" variant="ghost" defaultValue={1} />
    </div>
  );
}
