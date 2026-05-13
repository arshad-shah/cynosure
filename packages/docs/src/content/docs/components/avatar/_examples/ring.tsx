import { Avatar } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      <Avatar name="Jane Doe" ring />
      <Avatar name="John Smith" ring size="lg" />
      <Avatar name="Ada Lovelace" ring src="https://i.pravatar.cc/120?img=12" size="xl" />
    </div>
  );
}
