import { Box, Grid } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Grid
      columns={{ base: 1, sm: 2, md: 3 }}
      gap="3"
      padding="4"
      background="bg.subtle"
      borderRadius="md"
    >
      <Box padding="3" background="bg.surface" borderRadius="sm">
        A
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        B
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        C
      </Box>
    </Grid>
  );
}
