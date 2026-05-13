import { Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Text as="p">Rendered as a paragraph block.</Text>
      <Text as="span">Inline span run.</Text>
      <Text as="strong" weight="semibold">
        Strong emphasis
      </Text>
      <Text as="em" italic>
        Emphasised italic
      </Text>
    </div>
  );
}
