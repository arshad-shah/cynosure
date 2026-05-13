import { Avatar } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      <Avatar name="Jane Doe" status="online" />
      <Avatar name="John Smith" status="away" />
      <Avatar name="Sam Chen" status="busy" />
      <Avatar name="Ada Lovelace" status="offline" />
      <Avatar name="Grace Hopper" status="online" statusPosition="top-right" />
    </div>
  );
}
