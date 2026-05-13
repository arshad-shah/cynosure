import { Avatar, AvatarGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <AvatarGroup shape="circle" max={4}>
        <Avatar name="Jane Doe" />
        <Avatar name="John Smith" />
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Linus Torvalds" />
      </AvatarGroup>
      <AvatarGroup shape="rounded" max={4}>
        <Avatar name="Jane Doe" shape="rounded" />
        <Avatar name="John Smith" shape="rounded" />
        <Avatar name="Ada Lovelace" shape="rounded" />
        <Avatar name="Grace Hopper" shape="rounded" />
        <Avatar name="Linus Torvalds" shape="rounded" />
      </AvatarGroup>
      <AvatarGroup ring={false} max={4}>
        <Avatar name="Jane Doe" />
        <Avatar name="John Smith" />
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Linus Torvalds" />
      </AvatarGroup>
    </div>
  );
}
