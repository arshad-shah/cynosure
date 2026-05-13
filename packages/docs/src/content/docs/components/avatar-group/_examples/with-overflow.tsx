import { Avatar, AvatarGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <AvatarGroup max={3}>
      <Avatar name="Jane Doe" />
      <Avatar name="John Smith" />
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Linus Torvalds" />
      <Avatar name="Margaret Hamilton" />
    </AvatarGroup>
  );
}
