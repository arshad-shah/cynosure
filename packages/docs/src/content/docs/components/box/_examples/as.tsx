import { Box, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="2">
      <Box as="article" padding="3" background="bg.subtle" borderRadius="md">
        Rendered as &lt;article&gt;
      </Box>
      <Box as="aside" padding="3" background="bg.subtle" borderRadius="md">
        Rendered as &lt;aside&gt;
      </Box>
      <Box as="section" padding="3" background="bg.subtle" borderRadius="md">
        Rendered as &lt;section&gt; — a landmark region
      </Box>
    </Stack>
  );
}
