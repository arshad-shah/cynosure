import {
  Blockquote,
  Card,
  CardBody,
  CardHeader,
  Code,
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  Heading,
  Inline,
  Kbd,
  Link,
  List,
  ListItem,
  OrderedList,
  Stack,
  Text,
} from '@arshad-shah/cynosure-react';

export function TypographyPlayground() {
  return (
    <Stack gap="3">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Heading ramp
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="4">
            <Stack gap="2">
              <Text variant="overline" color="fg.muted">
                Semantic levels
              </Text>
              <Heading level={1}>h1 — Page title</Heading>
              <Heading level={2}>h2 — Section</Heading>
              <Heading level={3}>h3 — Subsection</Heading>
              <Heading level={4}>h4 — Sub-subsection</Heading>
              <Heading level={5}>h5 — Tight heading</Heading>
              <Heading level={6}>h6 — Label-sized</Heading>
            </Stack>
            <Stack gap="2">
              <Text variant="overline" color="fg.muted">
                Size variants
              </Text>
              {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const).map((size) => (
                <Inline key={size} gap="3" align="baseline">
                  <Text size="sm" color="fg.muted">
                    {size}
                  </Text>
                  <Heading level={2} size={size}>
                    The quick brown fox
                  </Heading>
                </Inline>
              ))}
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Text body
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="4">
            <Stack gap="2">
              <Text variant="overline" color="fg.muted">
                Sizes
              </Text>
              <Text size="xs">xs — The quick brown fox jumps over the lazy dog.</Text>
              <Text size="sm">sm — The quick brown fox jumps over the lazy dog.</Text>
              <Text size="md">md — The quick brown fox jumps over the lazy dog.</Text>
              <Text size="lg">lg — The quick brown fox jumps over the lazy dog.</Text>
              <Text size="xl">xl — The quick brown fox jumps over the lazy dog.</Text>
            </Stack>
            <Stack gap="2">
              <Text variant="overline" color="fg.muted">
                Weights
              </Text>
              <Text weight="regular">regular — The quick brown fox</Text>
              <Text weight="medium">medium — The quick brown fox</Text>
              <Text weight="semibold">semibold — The quick brown fox</Text>
              <Text weight="bold">bold — The quick brown fox</Text>
            </Stack>
            <Stack gap="2">
              <Text variant="overline" color="fg.muted">
                Colors
              </Text>
              <Text color="fg.default">fg.default — primary content</Text>
              <Text color="fg.muted">fg.muted — secondary annotations</Text>
              <Text color="accent.solid">accent.solid — emphasise an action</Text>
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Inline elements
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Text>
              Install with <Code>pnpm add @arshad-shah/cynosure-react</Code> and import from{' '}
              <Code colorScheme="accent">&quot;@arshad-shah/cynosure-react&quot;</Code>. Use{' '}
              <Code colorScheme="success">200 OK</Code> for healthy states and{' '}
              <Code colorScheme="danger">500 INTERNAL_ERROR</Code> for failures.
            </Text>
            <Text>
              Open the command palette with <Kbd>⌘</Kbd>+<Kbd>K</Kbd>, navigate with <Kbd>↑</Kbd> /{' '}
              <Kbd>↓</Kbd>, then press <Kbd>Enter</Kbd> to commit. On Windows use <Kbd>Ctrl</Kbd>+
              <Kbd>K</Kbd> instead.
            </Text>
            <Text>
              Read the <Link href="#typography">typography guide</Link> for full details, or visit{' '}
              <Link href="https://cynosure.arshadshah.com" external>
                the documentation site
              </Link>{' '}
              for the latest API reference.
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Blockquote
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="4">
            <Blockquote attribution="Tim Berners-Lee, inventor of the World Wide Web">
              The Web is more a social creation than a technical one. I designed it for a social
              effect — to help people work together — and not as a technical toy.
            </Blockquote>
            <Blockquote variant="callout" attribution="Cynosure design principle">
              Every non-primitive component composes Box. Tokens align first — everything else
              follows.
            </Blockquote>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Lists
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="4">
            <Stack gap="2">
              <Text variant="overline" color="fg.muted">
                Unordered (nested)
              </Text>
              <List spacing="2">
                <ListItem>Primitives</ListItem>
                <ListItem>
                  Layout
                  <List marker="circle" spacing="1">
                    <ListItem>Box</ListItem>
                    <ListItem>Stack</ListItem>
                    <ListItem>Inline</ListItem>
                    <ListItem>
                      Grid
                      <List marker="square" spacing="1">
                        <ListItem>templateColumns</ListItem>
                        <ListItem>columns shorthand</ListItem>
                      </List>
                    </ListItem>
                  </List>
                </ListItem>
                <ListItem>Typography</ListItem>
              </List>
            </Stack>
            <Stack gap="2">
              <Text variant="overline" color="fg.muted">
                Ordered (nested)
              </Text>
              <OrderedList spacing="2">
                <ListItem>Install the package</ListItem>
                <ListItem>
                  Wrap the app
                  <OrderedList marker="lower-alpha" spacing="1">
                    <ListItem>Import the provider</ListItem>
                    <ListItem>Mount at the root</ListItem>
                    <ListItem>Pass a theme</ListItem>
                  </OrderedList>
                </ListItem>
                <ListItem>Use primitives anywhere inside</ListItem>
                <ListItem>Ship</ListItem>
              </OrderedList>
            </Stack>
            <Stack gap="2">
              <Text variant="overline" color="fg.muted">
                Description list
              </Text>
              <DescriptionList>
                <DescriptionTerm>
                  <Code>Box</Code>
                </DescriptionTerm>
                <DescriptionDetails>
                  Zero-opinion div with the full layout surface.
                </DescriptionDetails>
                <DescriptionTerm>
                  <Code>Stack</Code>
                </DescriptionTerm>
                <DescriptionDetails>Vertical flex with consistent gap.</DescriptionDetails>
                <DescriptionTerm>
                  <Code>Inline</Code>
                </DescriptionTerm>
                <DescriptionDetails>Horizontal flex that wraps by default.</DescriptionDetails>
              </DescriptionList>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
