import { Box, Mark, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Box maxWidth="320px">
      <Text>
        Cynosure exposes a <Mark>thin inline-flow primitive that wraps text in a styled mark</Mark>{' '}
        — the highlight wraps with each line, with padding and rounded corners painted on every
        line.
      </Text>
    </Box>
  );
}
