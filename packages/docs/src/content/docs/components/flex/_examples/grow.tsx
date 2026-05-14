import { Box, Flex } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Flex gap="3" padding="4" background="bg.subtle" borderRadius="md">
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Fixed
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm" flex="1">
        Grows to fill remaining space
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Fixed
      </Box>
    </Flex>
  );
}
