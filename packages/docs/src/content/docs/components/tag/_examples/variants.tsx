import { Tag } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Tag variant="solid" colorScheme="accent">
        Accent
      </Tag>
      <Tag variant="soft" colorScheme="success">
        Success
      </Tag>
      <Tag variant="outline" colorScheme="warning">
        Warning
      </Tag>
      <Tag variant="ghost" colorScheme="danger">
        Danger
      </Tag>
      <Tag variant="soft" colorScheme="info">
        Info
      </Tag>
      <Tag variant="soft" colorScheme="neutral">
        Neutral
      </Tag>
    </div>
  );
}
