import { Rating } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Rating max={3} defaultValue={2} label="3-star" />
      <Rating max={5} defaultValue={4} label="5-star (default)" />
      <Rating max={10} defaultValue={7} label="10-star" />
    </div>
  );
}
