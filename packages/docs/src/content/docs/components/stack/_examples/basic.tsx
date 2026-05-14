import { Box, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="3" padding="4" background="bg.subtle" borderRadius="md">
      <Box padding="3" background="bg.surface" borderRadius="sm">
        First
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Second
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Third
      </Box>
    </Stack>
  );
}
