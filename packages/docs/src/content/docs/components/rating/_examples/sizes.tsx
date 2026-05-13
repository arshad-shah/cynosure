import { Rating } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Rating size="sm" defaultValue={3} label="Small" />
      <Rating size="md" defaultValue={3} label="Medium" />
      <Rating size="lg" defaultValue={3} label="Large" />
    </div>
  );
}
