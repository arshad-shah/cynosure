import { Box, Indicator, Inline } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline gap="5" padding="4" background="bg.subtle" borderRadius="md">
      {(['top-start', 'top-end', 'bottom-start', 'bottom-end'] as const).map((placement) => (
        <Indicator key={placement} content="•" placement={placement} aria-label={placement}>
          <Box padding="3" background="bg.surface" borderRadius="md" width="80px">
            {placement}
          </Box>
        </Indicator>
      ))}
    </Inline>
  );
}
