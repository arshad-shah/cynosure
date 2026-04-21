import { Badge } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      <Badge dot colorScheme="success" aria-label="Online" />
      <Badge dot colorScheme="warning" aria-label="Away" />
      <Badge dot colorScheme="danger" aria-label="Offline" />
      <Badge dot colorScheme="neutral" aria-label="Unknown" />
    </div>
  );
}
