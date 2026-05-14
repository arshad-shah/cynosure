import { Box, Indicator, Inline } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline gap="6" padding="4" background="bg.subtle" borderRadius="md">
      <Indicator dot colorScheme="success" placement="bottom-end" aria-label="Online">
        <Box padding="3" background="bg.surface" borderRadius="full" width="48px" height="48px" />
      </Indicator>
      <Indicator dot colorScheme="warning" placement="bottom-end" aria-label="Away">
        <Box padding="3" background="bg.surface" borderRadius="full" width="48px" height="48px" />
      </Indicator>
      <Indicator dot colorScheme="neutral" placement="bottom-end" aria-label="Offline">
        <Box padding="3" background="bg.surface" borderRadius="full" width="48px" height="48px" />
      </Indicator>
    </Inline>
  );
}
