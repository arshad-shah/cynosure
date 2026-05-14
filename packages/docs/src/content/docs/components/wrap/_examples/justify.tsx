import { Box, Wrap } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Wrap
      gap="2"
      justify="center"
      align="center"
      padding="4"
      background="bg.subtle"
      borderRadius="md"
    >
      {['short', 'a longer chip', 'mid', 'tiny', 'one more'].map((label) => (
        <Box key={label} padding="2" background="bg.surface" borderRadius="full">
          {label}
        </Box>
      ))}
    </Wrap>
  );
}
