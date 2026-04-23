import { Badge } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Badge variant="solid" colorScheme="accent">
        Solid
      </Badge>
      <Badge variant="soft" colorScheme="success">
        Soft
      </Badge>
      <Badge variant="outline" colorScheme="warning">
        Outline
      </Badge>
      <Badge variant="ghost" colorScheme="danger">
        Ghost
      </Badge>
      <Badge variant="solid" colorScheme="info">
        Info
      </Badge>
      <Badge variant="soft" colorScheme="neutral">
        Neutral
      </Badge>
    </div>
  );
}
