import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../primitives/layout/Box/Box.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Code } from '../Code/Code.js';
import { Heading } from '../Heading/Heading.js';
import { Link } from '../Link/Link.js';
import { Text } from '../Text/Text.js';
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  List,
  ListItem,
  OrderedList,
} from './List.js';

const meta: Meta = {
  title: 'Typography/List',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

// ── Unordered ─────────────────────────────────────────────────────────

export const Unordered: Story = {
  render: () => (
    <List spacing="2">
      <ListItem>Apples</ListItem>
      <ListItem>Bananas</ListItem>
      <ListItem>Cherries</ListItem>
    </List>
  ),
};

// ── Unordered markers ─────────────────────────────────────────────────

export const UnorderedMarkers: Story = {
  render: () => (
    <Stack gap="4" maxWidth="prose">
      {(['disc', 'circle', 'square', 'none'] as const).map((marker) => (
        <Stack key={marker} gap="1">
          <Text variant="overline">marker=&quot;{marker}&quot;</Text>
          <List marker={marker} spacing="1">
            <ListItem>First item</ListItem>
            <ListItem>Second item</ListItem>
            <ListItem>Third item</ListItem>
          </List>
        </Stack>
      ))}
    </Stack>
  ),
};

// ── Ordered ───────────────────────────────────────────────────────────

export const Ordered: Story = {
  render: () => (
    <OrderedList spacing="2">
      <ListItem>Install the package</ListItem>
      <ListItem>Import the provider at the root</ListItem>
      <ListItem>Use primitives anywhere inside</ListItem>
      <ListItem>Ship</ListItem>
    </OrderedList>
  ),
};

// ── Ordered variants (type/start/reversed) ────────────────────────────

export const OrderedVariants: Story = {
  render: () => (
    <Stack gap="4" maxWidth="prose">
      <Stack gap="2">
        <Text variant="overline">marker=&quot;lower-alpha&quot;</Text>
        <OrderedList marker="lower-alpha">
          <ListItem>alpha</ListItem>
          <ListItem>beta</ListItem>
          <ListItem>gamma</ListItem>
        </OrderedList>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">marker=&quot;upper-alpha&quot; start=&#123;3&#125;</Text>
        <OrderedList marker="upper-alpha" start={3}>
          <ListItem>Third</ListItem>
          <ListItem>Fourth</ListItem>
          <ListItem>Fifth</ListItem>
        </OrderedList>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">reversed</Text>
        <OrderedList reversed>
          <ListItem>Third (reversed)</ListItem>
          <ListItem>Second</ListItem>
          <ListItem>First</ListItem>
        </OrderedList>
      </Stack>
    </Stack>
  ),
};

// ── Description list ──────────────────────────────────────────────────

export const Description: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Cost</DescriptionTerm>
      <DescriptionDetails>$10</DescriptionDetails>
      <DescriptionTerm>Colour</DescriptionTerm>
      <DescriptionDetails>Blue</DescriptionDetails>
      <DescriptionTerm>Quantity</DescriptionTerm>
      <DescriptionDetails>42</DescriptionDetails>
      <DescriptionTerm>Ships in</DescriptionTerm>
      <DescriptionDetails>2&ndash;4 business days</DescriptionDetails>
    </DescriptionList>
  ),
};

// ── Marker color ──────────────────────────────────────────────────────

export const MarkerColor: Story = {
  render: () => (
    <Stack gap="4" maxWidth="prose">
      <List marker="disc" markerColor="accent.solid">
        <ListItem>Accent-coloured bullets</ListItem>
        <ListItem>Useful for branded checklists</ListItem>
        <ListItem>Pair with subtle body text</ListItem>
      </List>
      <OrderedList markerColor="feedback.success.solid">
        <ListItem>Markers can be coloured independently of text</ListItem>
        <ListItem>Here they pick up the success colour</ListItem>
      </OrderedList>
    </Stack>
  ),
};

// ── Nested lists ─────────────────────────────────────────────────────

export const Nested: Story = {
  render: () => (
    <List spacing="2" maxWidth="prose">
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
  ),
};

// ── Checklist pattern ─────────────────────────────────────────────────

export const Checklist: Story = {
  name: 'Checklist pattern',
  render: () => (
    <Stack gap="3" maxWidth="prose">
      <Heading level={3}>Release checklist</Heading>
      <List marker="none" spacing="2">
        <ListItem>
          <Text>✅ Changelog entry</Text>
        </ListItem>
        <ListItem>
          <Text>✅ Visual regression baseline refreshed</Text>
        </ListItem>
        <ListItem>
          <Text>🔲 Docs updated</Text>
        </ListItem>
        <ListItem>
          <Text>🔲 Release notes posted</Text>
        </ListItem>
      </List>
    </Stack>
  ),
};

// ── Realistic article ─────────────────────────────────────────────────

export const InArticle: Story = {
  render: () => (
    <Stack gap="4" maxWidth="prose">
      <Heading level={2}>Primitives we ship</Heading>
      <Text>
        The Lumen primitives are split into two layers. <strong>Layout primitives</strong> solve
        flow, spacing, and sizing; <strong>typography primitives</strong> solve hierarchy and
        readability. Here is a terse map:
      </Text>
      <DescriptionList>
        <DescriptionTerm>
          <Code>Box</Code>
        </DescriptionTerm>
        <DescriptionDetails>Zero-opinion div with the full layout surface.</DescriptionDetails>
        <DescriptionTerm>
          <Code>Stack</Code>
        </DescriptionTerm>
        <DescriptionDetails>Vertical flex with consistent gap.</DescriptionDetails>
        <DescriptionTerm>
          <Code>Inline</Code>
        </DescriptionTerm>
        <DescriptionDetails>
          Horizontal flex that wraps by default; opt-out with <Code>wrap=&#123;false&#125;</Code>.
        </DescriptionDetails>
      </DescriptionList>
      <Text>Further reading:</Text>
      <List spacing="1" marker="disc">
        <ListItem>
          <Link href="#layout">The layout primitives guide</Link>
        </ListItem>
        <ListItem>
          <Link href="#typography">Typography fundamentals</Link>
        </ListItem>
        <ListItem>
          <Link href="https://example.com" external>
            External design system references
          </Link>
        </ListItem>
      </List>
    </Stack>
  ),
};

// ── Spacing variants ─────────────────────────────────────────────────

export const SpacingScale: Story = {
  render: () => (
    <Box padding="3" maxWidth="prose">
      <Stack gap="4">
        {(['0.5', '1', '2', '4'] as const).map((spacing) => (
          <Stack key={spacing} gap="2">
            <Text variant="overline">spacing=&quot;{spacing}&quot;</Text>
            <List spacing={spacing}>
              <ListItem>First item</ListItem>
              <ListItem>Second item</ListItem>
              <ListItem>Third item</ListItem>
            </List>
          </Stack>
        ))}
      </Stack>
    </Box>
  ),
};
