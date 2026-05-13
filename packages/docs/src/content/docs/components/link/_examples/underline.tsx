import { Link } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <Link href="/docs" underline="hover">
        Underline on hover
      </Link>
      <Link href="/docs" underline="always">
        Always underlined
      </Link>
      <Link href="/docs" underline="none">
        No underline
      </Link>
    </div>
  );
}
