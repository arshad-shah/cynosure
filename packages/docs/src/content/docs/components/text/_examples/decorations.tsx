import { Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Text italic>Italic emphasis</Text>
      <Text underline>Underlined run</Text>
      <Text strikethrough>Struck-through value</Text>
      <Text underline strikethrough>
        Both decorations together
      </Text>
    </div>
  );
}
