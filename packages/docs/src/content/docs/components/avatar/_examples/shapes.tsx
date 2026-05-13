import { Avatar } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      <Avatar name="Jane Doe" shape="circle" />
      <Avatar name="Jane Doe" shape="rounded" />
      <Avatar name="Jane Doe" shape="square" />
    </div>
  );
}
