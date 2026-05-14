import { Mark, Stack, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="2">
      <Text>
        marker — the <Mark variant="marker">highlighted</Mark> phrase.
      </Text>
      <Text>
        underline — the <Mark variant="underline">highlighted</Mark> phrase.
      </Text>
      <Text>
        chip — the <Mark variant="chip">highlighted</Mark> phrase.
      </Text>
      <Text>
        bold — the <Mark variant="bold">highlighted</Mark> phrase.
      </Text>
    </Stack>
  );
}
