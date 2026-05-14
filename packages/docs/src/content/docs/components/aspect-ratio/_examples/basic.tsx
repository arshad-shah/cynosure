import { AspectRatio, Center, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <AspectRatio ratio={16 / 9} background="bg.subtle" borderRadius="md">
      <Center>
        <Text color="fg.muted">16 : 9</Text>
      </Center>
    </AspectRatio>
  );
}
