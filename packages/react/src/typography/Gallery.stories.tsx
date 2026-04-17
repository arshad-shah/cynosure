import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../primitives/layout/Box/Box.js';
import { Container } from '../primitives/layout/Container/Container.js';
import { Divider } from '../primitives/layout/Divider/Divider.js';
import { Inline } from '../primitives/layout/Inline/Inline.js';
import { Section } from '../primitives/layout/Section/Section.js';
import { Stack } from '../primitives/layout/Stack/Stack.js';
import { Blockquote } from './Blockquote/Blockquote.js';
import { Code } from './Code/Code.js';
import { Heading } from './Heading/Heading.js';
import { Kbd } from './Kbd/Kbd.js';
import { Link } from './Link/Link.js';
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  List,
  ListItem,
  OrderedList,
} from './List/List.js';
import { Text } from './Text/Text.js';

const meta: Meta = {
  title: 'Typography/Gallery',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

// ── Typographic scale gallery ─────────────────────────────────────────

export const Scale: Story = {
  name: 'Typographic scale',
  render: () => (
    <Box background="bg.canvas" minHeight="screen">
      <Section space="lg" paddingX={{ base: '4', md: '6' }}>
        <Container size="prose">
          <Stack gap="8">
            <Stack gap="2">
              <Heading level={1}>Typographic scale</Heading>
              <Text variant="lead" size="lg">
                Every heading, body size, and list marker in a single view. Use this to calibrate
                your sense of hierarchy across the system.
              </Text>
            </Stack>

            <Divider />

            <Stack gap="4">
              <Heading level={2} size="xl">
                Headings
              </Heading>
              <Stack gap="3">
                <Heading level={1}>h1 &mdash; 5xl by default</Heading>
                <Heading level={2}>h2 &mdash; 4xl by default</Heading>
                <Heading level={3}>h3 &mdash; 3xl by default</Heading>
                <Heading level={4}>h4 &mdash; 2xl by default</Heading>
                <Heading level={5}>h5 &mdash; xl by default</Heading>
                <Heading level={6}>h6 &mdash; lg by default</Heading>
              </Stack>
            </Stack>

            <Divider />

            <Stack gap="4">
              <Heading level={2} size="xl">
                Body sizes
              </Heading>
              <Stack gap="2">
                <Text size="xl">xl &mdash; The quick brown fox jumps over the lazy dog.</Text>
                <Text size="lg">lg &mdash; The quick brown fox jumps over the lazy dog.</Text>
                <Text size="md">md &mdash; The quick brown fox jumps over the lazy dog.</Text>
                <Text size="sm">sm &mdash; The quick brown fox jumps over the lazy dog.</Text>
                <Text size="xs">xs &mdash; The quick brown fox jumps over the lazy dog.</Text>
              </Stack>
            </Stack>

            <Divider />

            <Stack gap="4">
              <Heading level={2} size="xl">
                Variants
              </Heading>
              <Stack gap="2">
                <Text variant="body">body &mdash; the default content voice.</Text>
                <Text variant="lead" size="lg">
                  lead &mdash; introduces a section with relaxed line-height.
                </Text>
                <Text variant="caption">caption &mdash; smaller, muted annotations.</Text>
                <Text variant="overline">overline &mdash; uppercase label</Text>
              </Stack>
            </Stack>

            <Divider />

            <Stack gap="4">
              <Heading level={2} size="xl">
                Weights &amp; decorations
              </Heading>
              <Inline gap="4" wrap>
                <Text weight="regular">regular</Text>
                <Text weight="medium">medium</Text>
                <Text weight="semibold">semibold</Text>
                <Text weight="bold">bold</Text>
              </Inline>
              <Inline gap="4" wrap>
                <Text italic>italic</Text>
                <Text underline>underline</Text>
                <Text strikethrough>strikethrough</Text>
                <Text underline decorationColor="accent.solid">
                  accent underline
                </Text>
              </Inline>
            </Stack>

            <Divider />

            <Stack gap="4">
              <Heading level={2} size="xl">
                Lists
              </Heading>
              <Stack gap="3">
                <Stack gap="1">
                  <Text variant="overline">Unordered</Text>
                  <List spacing="1">
                    <ListItem>Primitives</ListItem>
                    <ListItem>Typography</ListItem>
                    <ListItem>Forms</ListItem>
                  </List>
                </Stack>
                <Stack gap="1">
                  <Text variant="overline">Ordered</Text>
                  <OrderedList spacing="1">
                    <ListItem>Install the package</ListItem>
                    <ListItem>Import the provider</ListItem>
                    <ListItem>Build</ListItem>
                  </OrderedList>
                </Stack>
                <Stack gap="1">
                  <Text variant="overline">Description list</Text>
                  <DescriptionList>
                    <DescriptionTerm>Package</DescriptionTerm>
                    <DescriptionDetails>
                      <Code>@lumen/react</Code>
                    </DescriptionDetails>
                    <DescriptionTerm>License</DescriptionTerm>
                    <DescriptionDetails>MIT</DescriptionDetails>
                  </DescriptionList>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            <Stack gap="4">
              <Heading level={2} size="xl">
                Inline elements
              </Heading>
              <Text>
                Install with <Code>pnpm add @lumen/react</Code>, then press <Kbd>⌘</Kbd>+
                <Kbd>K</Kbd> to open the palette. Full docs at{' '}
                <Link href="https://lumen.dev" external>
                  lumen.dev
                </Link>
                .
              </Text>
            </Stack>

            <Divider />

            <Stack gap="4">
              <Heading level={2} size="xl">
                Blockquote
              </Heading>
              <Blockquote variant="callout" attribution="Design principle">
                Every non-primitive component composes Box. No raw JSX elements in component bodies.
              </Blockquote>
            </Stack>
          </Stack>
        </Container>
      </Section>
    </Box>
  ),
};

// ── Overview (smaller compact view) ──────────────────────────────────

export const Overview: Story = {
  render: () => (
    <Stack gap="6" padding="6" maxWidth="prose">
      <Heading level={1}>Lumen typography</Heading>
      <Text variant="lead" size="lg">
        A lean set of text primitives composed on top of <Code>Box</Code>.
      </Text>

      <Heading level={2}>Headings decouple level from size</Heading>
      <Text>
        Use <Code>level</Code> for semantics (h1 for page title, h2 for sections), and{' '}
        <Code>size</Code> to match the visual hierarchy your designer drew. An h1 at body-xs is
        perfectly legal.
      </Text>

      <Heading level={3}>Lists</Heading>
      <List spacing="2">
        <ListItem>Text, Heading, Code, Kbd</ListItem>
        <ListItem>Link, Blockquote</ListItem>
        <ListItem>List, OrderedList, DescriptionList</ListItem>
      </List>

      <Heading level={3}>Keyboard hints</Heading>
      <Text>
        Press <Kbd>⌘</Kbd>+<Kbd>K</Kbd> to open the palette.
      </Text>

      <Blockquote variant="callout" attribution="Design principle">
        Every non-primitive component composes Box. No raw JSX elements in component bodies.
      </Blockquote>

      <Heading level={3}>Metadata</Heading>
      <DescriptionList>
        <DescriptionTerm>Package</DescriptionTerm>
        <DescriptionDetails>
          <Code>@lumen/react</Code>
        </DescriptionDetails>
        <DescriptionTerm>Docs</DescriptionTerm>
        <DescriptionDetails>
          <Link href="https://lumen.dev" external>
            lumen.dev
          </Link>
        </DescriptionDetails>
      </DescriptionList>
    </Stack>
  ),
};

// ── Realistic blog article ───────────────────────────────────────────

export const BlogArticle: Story = {
  render: () => (
    <Box background="bg.canvas" minHeight="screen">
      <Section space="lg" paddingX={{ base: '4', md: '6' }}>
        <Container size="prose">
          <Stack gap="4">
            <Text variant="overline">ENGINEERING</Text>
            <Heading level={1}>Why we ship &ldquo;boring&rdquo; primitives</Heading>
            <Inline gap="2" align="center">
              <Box width="32px" height="32px" borderRadius="full" background="accent.solid" />
              <Stack gap="0">
                <Text size="sm" weight="semibold">
                  Alex Doyle
                </Text>
                <Text size="xs" color="fg.muted">
                  Apr 17, 2026 &middot; 6 min read
                </Text>
              </Stack>
            </Inline>

            <Divider />

            <Text variant="lead" size="lg">
              Excitement is a poor design principle. A design system that delights on day one and
              fights you on day 300 is a failure. Here&rsquo;s the case for primitives whose only
              goal is to get out of your way.
            </Text>

            <Heading level={2}>Predictable surfaces beat clever ones</Heading>
            <Text>
              Every Lumen primitive accepts a <Code>LayoutProps</Code> superset. That means{' '}
              <Code>padding=&quot;4&quot;</Code>, <Code>background=&quot;bg.surface&quot;</Code>,
              and <Code>borderRadius=&quot;md&quot;</Code> work on <em>any</em> component. Learn the
              surface once, use it everywhere.
            </Text>

            <Heading level={3}>Token-first APIs</Heading>
            <Text>
              When a designer changes a token value, everything downstream updates automatically. No
              find/replace across components; no style overrides.
            </Text>

            <Blockquote variant="callout" attribution="An engineer who escaped CSS-in-JS">
              I don&rsquo;t want to pick a colour. I want to pick a purpose.
            </Blockquote>

            <Heading level={2}>Shortcut to productivity</Heading>
            <Text>
              Open the command palette with <Kbd>⌘</Kbd>+<Kbd>K</Kbd>, type <Code>primitive:</Code>,
              and scan the built-in catalogue. The same shortcuts work in the docs site and every
              downstream app.
            </Text>

            <Heading level={3}>Further reading</Heading>
            <List spacing="1">
              <ListItem>
                <Link href="#tokens">Tokens and primitives</Link>
              </ListItem>
              <ListItem>
                <Link href="#composing">Composing your first screen</Link>
              </ListItem>
              <ListItem>
                <Link href="https://lumen.dev/blog" external>
                  More from the Lumen blog
                </Link>
              </ListItem>
            </List>
          </Stack>
        </Container>
      </Section>
    </Box>
  ),
};
