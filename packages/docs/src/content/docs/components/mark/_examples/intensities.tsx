import { Mark, Stack, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="2">
      <Text>
        subtle <Mark intensity="subtle">amber</Mark> / solid <Mark intensity="solid">amber</Mark>
      </Text>
      <Text>
        subtle{' '}
        <Mark colorScheme="danger" intensity="subtle">
          red
        </Mark>{' '}
        / solid{' '}
        <Mark colorScheme="danger" intensity="solid">
          red
        </Mark>
      </Text>
    </Stack>
  );
}
