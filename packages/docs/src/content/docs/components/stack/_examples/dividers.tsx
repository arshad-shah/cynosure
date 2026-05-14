import { Divider, Stack, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="3" padding="4" background="bg.subtle" borderRadius="md" dividers={<Divider />}>
      <Text weight="semibold">First section</Text>
      <Text weight="semibold">Second section</Text>
      <Text weight="semibold">Third section</Text>
    </Stack>
  );
}
