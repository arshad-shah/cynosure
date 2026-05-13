import { Kbd, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Text>
      Press <Kbd size="sm">⌘</Kbd> <Kbd size="sm">K</Kbd> to open the command palette, or{' '}
      <Kbd size="sm">Esc</Kbd> to dismiss it.
    </Text>
  );
}
