import { NumberInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '200px' }}>
      <NumberInput aria-label="Default" defaultValue={5} />
      <NumberInput aria-label="Invalid" defaultValue={-1} invalid />
      <NumberInput aria-label="Disabled" defaultValue={5} isDisabled />
      <NumberInput aria-label="Read-only" defaultValue={5} isReadOnly />
    </div>
  );
}
