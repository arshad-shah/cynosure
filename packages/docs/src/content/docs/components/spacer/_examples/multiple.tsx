import { Box, Inline, Spacer } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline gap="3" padding="4" background="bg.subtle" borderRadius="md" align="center">
      <Box padding="2" background="bg.surface" borderRadius="sm">
        Logo
      </Box>
      <Spacer />
      <Box padding="2" background="bg.surface" borderRadius="sm">
        Center
      </Box>
      <Spacer />
      <Box padding="2" background="bg.surface" borderRadius="sm">
        Actions
      </Box>
    </Inline>
  );
}
