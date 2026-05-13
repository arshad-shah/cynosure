import { Avatar } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      <Avatar name="Jane Doe" size="xs" />
      <Avatar name="Jane Doe" size="sm" />
      <Avatar name="Jane Doe" size="md" />
      <Avatar name="Jane Doe" size="lg" />
      <Avatar name="Jane Doe" size="xl" />
      <Avatar name="Jane Doe" size="2xl" />
    </div>
  );
}
