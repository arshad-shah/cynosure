import { Avatar } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Linus Torvalds" />
      <Avatar name="Margaret Hamilton" />
      <Avatar name="Donald Knuth" colorScheme="violet" />
      <Avatar initials="?" colorScheme="teal" />
    </div>
  );
}
