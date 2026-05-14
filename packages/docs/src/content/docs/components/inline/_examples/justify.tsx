import { Box, Inline } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline
      gap="3"
      justify="between"
      align="center"
      padding="4"
      background="bg.subtle"
      borderRadius="md"
    >
      <Box padding="2" background="bg.surface" borderRadius="sm">
        Left edge
      </Box>
      <Box padding="2" background="bg.surface" borderRadius="sm">
        Right edge
      </Box>
    </Inline>
  );
}
