import { Chip } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Chip variant="solid" colorScheme="accent">
        Accent
      </Chip>
      <Chip variant="soft" colorScheme="success">
        Success
      </Chip>
      <Chip variant="outline" colorScheme="warning">
        Warning
      </Chip>
      <Chip variant="ghost" colorScheme="danger">
        Danger
      </Chip>
      <Chip variant="soft" colorScheme="info">
        Info
      </Chip>
      <Chip variant="soft" colorScheme="neutral">
        Neutral
      </Chip>
    </div>
  );
}
