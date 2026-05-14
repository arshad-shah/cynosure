import { Box } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Box
      padding={{ base: '2', md: '4', lg: '6' }}
      background={{ base: 'bg.subtle', md: 'accent.soft' }}
      borderRadius={{ base: 'sm', md: 'md', lg: 'lg' }}
      maxWidth={{ base: '100%', md: '420px' }}
    >
      Resize the preview — padding, background, radius, and width all shift at each breakpoint.
    </Box>
  );
}
