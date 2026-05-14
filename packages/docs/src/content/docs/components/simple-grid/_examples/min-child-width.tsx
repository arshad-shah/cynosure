import { Box, SimpleGrid } from '@arshad-shah/cynosure-react';

const TILES = ['Aurora', 'Borealis', 'Cassiopeia', 'Draco', 'Eridanus', 'Fornax', 'Gemini'];

export default function Example() {
  return (
    <SimpleGrid minChildWidth="180px" gap="3" padding="4" background="bg.subtle" borderRadius="md">
      {TILES.map((label) => (
        <Box key={label} padding="3" background="bg.surface" borderRadius="sm">
          {label}
        </Box>
      ))}
    </SimpleGrid>
  );
}
