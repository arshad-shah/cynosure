import { Container, Heading, Section, Stack, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Section space="lg" background="bg.subtle" borderRadius="md">
      <Container size="md">
        <Stack gap="3">
          <Heading level={2} size="lg" id="features">
            Features
          </Heading>
          <Text color="fg.muted">
            Section owns the vertical rhythm; Container caps the horizontal measure. Together they
            produce a padded, centred slab of content with no bespoke CSS.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
