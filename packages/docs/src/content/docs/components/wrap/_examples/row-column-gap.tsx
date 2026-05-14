import { Box, Wrap } from '@arshad-shah/cynosure-react';

const TAGS = ['design', 'systems', 'tokens', 'typography', 'layout', 'forms', 'overlays', 'a11y'];

export default function Example() {
  return (
    <Wrap rowGap="3" columnGap="2" padding="4" background="bg.subtle" borderRadius="md">
      {TAGS.map((t) => (
        <Box key={t} padding="2" background="bg.surface" borderRadius="full">
          {t}
        </Box>
      ))}
    </Wrap>
  );
}
