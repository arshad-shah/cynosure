import { Inline, Spacer, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline gap="3" padding="4" background="bg.subtle" borderRadius="md">
      <Text>Left edge</Text>
      <Spacer />
      <Text>Right edge</Text>
    </Inline>
  );
}
