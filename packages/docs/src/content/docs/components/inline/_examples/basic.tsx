import { Box, Inline } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline gap="3" padding="4" background="bg.subtle" borderRadius="md" wrap>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        One
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Two
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Three
      </Box>
    </Inline>
  );
}
