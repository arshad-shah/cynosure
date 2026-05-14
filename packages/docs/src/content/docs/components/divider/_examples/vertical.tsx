import { Divider, Inline, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline gap="3" align="center" padding="3" background="bg.subtle" borderRadius="md">
      <Text>Files</Text>
      <Divider orientation="vertical" length="1rem" />
      <Text>Activity</Text>
      <Divider orientation="vertical" length="1rem" />
      <Text>Settings</Text>
    </Inline>
  );
}
