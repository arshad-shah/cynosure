import { Divider, Stack, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="3">
      <Text>Above the fold</Text>
      <Divider labelAlign="center">OR</Divider>
      <Text>Below the fold</Text>
    </Stack>
  );
}
