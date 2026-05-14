import { Box, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="2" align="center" padding="4" background="bg.subtle" borderRadius="md">
      <Box padding="2" background="bg.surface" borderRadius="sm" width="40%">
        Narrow row
      </Box>
      <Box padding="2" background="bg.surface" borderRadius="sm" width="70%">
        Wider row
      </Box>
      <Box padding="2" background="bg.surface" borderRadius="sm" width="55%">
        Centered horizontally
      </Box>
    </Stack>
  );
}
