import { Box, SimpleGrid } from '@arshad-shah/cynosure-react';

const CARDS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];

export default function Example() {
  return (
    <SimpleGrid
      columns={{ base: 1, sm: 2, lg: 3 }}
      gap="3"
      padding="4"
      background="bg.subtle"
      borderRadius="md"
    >
      {CARDS.map((label) => (
        <Box key={label} padding="3" background="bg.surface" borderRadius="sm">
          {label}
        </Box>
      ))}
    </SimpleGrid>
  );
}
