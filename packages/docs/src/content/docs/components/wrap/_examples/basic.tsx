import { Box, Wrap } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Wrap gap="2" padding="4" background="bg.subtle" borderRadius="md">
      <Box padding="2" background="bg.surface" borderRadius="sm">
        tag-one
      </Box>
      <Box padding="2" background="bg.surface" borderRadius="sm">
        tag-two
      </Box>
      <Box padding="2" background="bg.surface" borderRadius="sm">
        tag-three
      </Box>
      <Box padding="2" background="bg.surface" borderRadius="sm">
        tag-four
      </Box>
      <Box padding="2" background="bg.surface" borderRadius="sm">
        tag-five
      </Box>
    </Wrap>
  );
}
