import { Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '20rem' }}>
      <Text truncate>
        Single-line truncation keeps a label tidy when space is tight and the string runs long.
      </Text>
      <Text truncate={3}>
        Multi-line clamp lets the copy breathe for a few rows before fading out. Useful for card
        descriptions where you want a hint of the body without surrendering the layout to an
        unbounded paragraph.
      </Text>
    </div>
  );
}
