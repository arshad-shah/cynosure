import { Box, Indicator } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Indicator content="3" colorScheme="danger">
      <Box padding="3" background="bg.subtle" borderRadius="md">
        Inbox
      </Box>
    </Indicator>
  );
}
