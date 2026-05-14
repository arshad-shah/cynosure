import { Box, Flex } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap="3"
      padding="4"
      background="bg.subtle"
      borderRadius="md"
    >
      <Box padding="3" background="bg.surface" borderRadius="sm" flex="1">
        Stacks on narrow viewports
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm" flex="1">
        Sits side-by-side from `md` up
      </Box>
    </Flex>
  );
}
