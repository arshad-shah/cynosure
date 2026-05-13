import { Rating } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Rating defaultValue={4} label="Default" />
      <Rating defaultValue={4} label="Read-only" readOnly />
      <Rating defaultValue={4} label="Disabled" disabled />
    </div>
  );
}
