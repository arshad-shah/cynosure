import { Avatar, AvatarGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <AvatarGroup size="sm">
        <Avatar name="Jane Doe" />
        <Avatar name="John Smith" />
        <Avatar name="Ada Lovelace" />
      </AvatarGroup>
      <AvatarGroup size="md">
        <Avatar name="Jane Doe" />
        <Avatar name="John Smith" />
        <Avatar name="Ada Lovelace" />
      </AvatarGroup>
      <AvatarGroup size="lg">
        <Avatar name="Jane Doe" />
        <Avatar name="John Smith" />
        <Avatar name="Ada Lovelace" />
      </AvatarGroup>
    </div>
  );
}
