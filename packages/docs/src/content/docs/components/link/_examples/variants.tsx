import { Link } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <Link href="/docs" variant="default">
        Default link
      </Link>
      <Link href="/docs" variant="subtle">
        Subtle link
      </Link>
      <Link href="/docs" variant="emphasis">
        Emphasised link
      </Link>
    </div>
  );
}
