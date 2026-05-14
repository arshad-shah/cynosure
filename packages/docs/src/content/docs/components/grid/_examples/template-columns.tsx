import { Box, Grid } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Grid templateColumns="160px 1fr" gap="3" padding="4" background="bg.subtle" borderRadius="md">
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Sidebar (160px)
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        Main column (1fr)
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm" gridColumn="1 / -1">
        Footer (spans both columns)
      </Box>
    </Grid>
  );
}
