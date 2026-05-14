import { Container, Stack, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="3">
      {(['sm', 'md', 'lg', 'prose'] as const).map((size) => (
        <Container key={size} size={size} padding="3" background="bg.subtle" borderRadius="md">
          <Text>
            <code>size="{size}"</code> — content capped at this measure
          </Text>
        </Container>
      ))}
    </Stack>
  );
}
