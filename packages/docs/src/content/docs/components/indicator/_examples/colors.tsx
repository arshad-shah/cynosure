import { Box, Indicator, Inline } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline gap="5" padding="4" background="bg.subtle" borderRadius="md">
      {(['accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const).map((scheme) => (
        <Indicator key={scheme} content="3" colorScheme={scheme} aria-label={`${scheme} count`}>
          <Box padding="3" background="bg.surface" borderRadius="md">
            {scheme}
          </Box>
        </Indicator>
      ))}
    </Inline>
  );
}
