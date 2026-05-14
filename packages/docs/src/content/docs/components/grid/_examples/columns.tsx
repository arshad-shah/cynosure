import { Box, Grid } from '@arshad-shah/cynosure-react';

const CELLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function Example() {
  return (
    <Grid
      columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
      gap="3"
      padding="4"
      background="bg.subtle"
      borderRadius="md"
    >
      {CELLS.map((cell) => (
        <Box key={cell} padding="3" background="bg.surface" borderRadius="sm">
          Cell {cell}
        </Box>
      ))}
    </Grid>
  );
}
