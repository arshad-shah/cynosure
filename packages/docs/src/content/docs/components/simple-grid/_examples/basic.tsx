import { Box, SimpleGrid } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <SimpleGrid
      columns={{ base: 2, md: 4 }}
      gap="3"
      padding="4"
      background="bg.subtle"
      borderRadius="md"
    >
      <Box padding="3" background="bg.surface" borderRadius="sm">
        1
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        2
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        3
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        4
      </Box>
    </SimpleGrid>
  );
}
