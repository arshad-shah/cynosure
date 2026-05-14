import { Box } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Box
      padding="4"
      paddingX="6"
      width="100%"
      maxWidth="280px"
      background="bg.subtle"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.subtle"
    >
      Token-driven width, padding, border, and surface — all via props.
    </Box>
  );
}
