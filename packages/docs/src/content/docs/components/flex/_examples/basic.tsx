import { Box, Flex } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Flex
      direction="row"
      gap="3"
      justify="between"
      align="center"
      padding="4"
      background="bg.subtle"
      borderRadius="md"
    >
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Left
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Middle
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Right
      </Box>
    </Flex>
  );
}
