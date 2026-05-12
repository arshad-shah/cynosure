import {
  Card,
  CardBody,
  CardHeader,
  Code,
  Heading,
  Kbd,
  Link,
  Stack,
  Text,
} from '@arshad-shah/cynosure-react';

export function TypographyPlayground() {
  return (
    <Stack gap="3">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Headings
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Heading level={1} size="3xl">
              Display headline
            </Heading>
            <Heading level={2} size="2xl">
              Section title
            </Heading>
            <Heading level={3} size="xl">
              Subsection
            </Heading>
            <Heading level={4} size="lg">
              Card heading
            </Heading>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Body
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Text size="lg">
              Long-form lede paragraph for the start of an article. Cynosure ships a fluid type ramp
              tuned for 1.4–1.6 line-heights at every size.
            </Text>
            <Text>
              Default body copy. Press <Kbd>Cmd</Kbd> <Kbd>K</Kbd> to open the command palette, or
              visit the <Link href="https://cynosure.arshadshah.com">docs site</Link> for more.
            </Text>
            <Text size="sm">
              Small caption. Use <Code>{`color="fg.muted"`}</Code> to dim secondary text.
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Inline
          </Heading>
        </CardHeader>
        <CardBody>
          <Text>
            Render code with <Code>&lt;Code&gt;</Code>, link to other pages with{' '}
            <Link href="#charts">internal anchors</Link>, and surface keyboard shortcuts as{' '}
            <Kbd>Ctrl</Kbd> + <Kbd>P</Kbd>.
          </Text>
        </CardBody>
      </Card>
    </Stack>
  );
}
