import { Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Text variant="overline" size="xs">
        Section eyebrow
      </Text>
      <Text variant="lead" size="lg">
        Lead paragraph carries the room with a relaxed line-height.
      </Text>
      <Text>Default body sits in between for sustained reading.</Text>
      <Text variant="caption" size="sm">
        Caption text holds metadata in muted tone.
      </Text>
    </div>
  );
}
