import { Rating } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Rating allowHalf defaultValue={2.5} label="2.5 of 5" />
      <Rating allowHalf defaultValue={3.5} label="3.5 of 5" />
      <Rating allowHalf defaultValue={4.5} label="4.5 of 5" size="lg" />
    </div>
  );
}
