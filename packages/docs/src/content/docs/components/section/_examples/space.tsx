import { Section, Stack, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="2">
      {(['sm', 'md', 'lg', 'xl'] as const).map((space) => (
        <Section key={space} space={space} background="bg.subtle" borderRadius="md">
          <Text>
            <code>space="{space}"</code>
          </Text>
        </Section>
      ))}
    </Stack>
  );
}
