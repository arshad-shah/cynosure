import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../primitives/layout/Box/Box.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../Heading/Heading.js';
import { Text } from './Text.js';

const meta: Meta<typeof Text> = {
  title: 'Typography/Text',
  component: Text,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold', 'bold'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'justify'] },
    variant: { control: 'select', options: ['body', 'caption', 'overline', 'lead'] },
    italic: { control: 'boolean' },
    underline: { control: 'boolean' },
    strikethrough: { control: 'boolean' },
    as: {
      control: 'select',
      options: ['span', 'p', 'div', 'label', 'strong', 'em'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Text>;

export const Playground: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
    size: 'md',
    weight: 'regular',
    variant: 'body',
  },
};

// ── Sizes ─────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      <Text size="xs">xs &mdash; The quick brown fox jumps over the lazy dog.</Text>
      <Text size="sm">sm &mdash; The quick brown fox jumps over the lazy dog.</Text>
      <Text size="md">md &mdash; The quick brown fox jumps over the lazy dog.</Text>
      <Text size="lg">lg &mdash; The quick brown fox jumps over the lazy dog.</Text>
      <Text size="xl">xl &mdash; The quick brown fox jumps over the lazy dog.</Text>
    </Stack>
  ),
};

// ── Weights ───────────────────────────────────────────────────────────

export const Weights: Story = {
  render: () => (
    <Stack gap="2">
      <Text weight="regular">regular &mdash; The quick brown fox</Text>
      <Text weight="medium">medium &mdash; The quick brown fox</Text>
      <Text weight="semibold">semibold &mdash; The quick brown fox</Text>
      <Text weight="bold">bold &mdash; The quick brown fox</Text>
    </Stack>
  ),
};

// ── Variants ──────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <Stack gap="3" maxWidth="prose">
      <Text variant="body">
        body &mdash; the default content voice. Use it for paragraphs, descriptions, and most
        running copy.
      </Text>
      <Text variant="lead" size="lg">
        lead &mdash; introduces a section with slightly relaxed line-height. Often one step larger
        than body.
      </Text>
      <Text variant="caption">caption &mdash; smaller, muted annotations beneath a figure.</Text>
      <Text variant="overline">overline &mdash; uppercase label</Text>
    </Stack>
  ),
};

// ── Alignment ─────────────────────────────────────────────────────────

export const Alignment: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Text align="start">align=&quot;start&quot; &mdash; default left alignment.</Text>
      <Text align="center">align=&quot;center&quot;</Text>
      <Text align="end">align=&quot;end&quot;</Text>
      <Text align="justify">
        align=&quot;justify&quot; &mdash; justified text distributes remaining horizontal space to
        even out the right edge. Best for long paragraphs in narrow containers.
      </Text>
    </Stack>
  ),
};

// ── Color tokens ──────────────────────────────────────────────────────

export const ColorTokens: Story = {
  render: () => (
    <Stack gap="2">
      <Text color="fg.default">fg.default &mdash; primary content</Text>
      <Text color="fg.muted">fg.muted &mdash; secondary / annotations</Text>
      <Text color="fg.subtle">fg.subtle &mdash; tertiary / disabled hints</Text>
      <Text color="accent.solid">accent.solid &mdash; emphasise an action</Text>
      <Text color="feedback.success.foreground">feedback.success.foreground &mdash; success</Text>
      <Text color="feedback.danger.foreground">feedback.danger.foreground &mdash; error</Text>
      <Text color="feedback.warning.foreground">feedback.warning.foreground &mdash; warning</Text>
      <Box padding="2" background="accent.solid" borderRadius="sm">
        <Text color="accent.onSolid">accent.onSolid on accent.solid</Text>
      </Box>
    </Stack>
  ),
};

// ── Decorations ──────────────────────────────────────────────────────

export const Decorations: Story = {
  render: () => (
    <Stack gap="2">
      <Text italic>italic &mdash; The quick brown fox</Text>
      <Text underline>underline &mdash; The quick brown fox</Text>
      <Text strikethrough>strikethrough &mdash; The quick brown fox</Text>
      <Text underline strikethrough>
        underline + strikethrough &mdash; The quick brown fox
      </Text>
      <Text underline decorationColor="accent.solid">
        accent underline color &mdash; The quick brown fox
      </Text>
      <Text strikethrough decorationColor="feedback.danger.solid">
        danger strikethrough &mdash; Out of stock
      </Text>
    </Stack>
  ),
};

// ── Truncation ───────────────────────────────────────────────────────

export const Truncation: Story = {
  render: () => (
    <Stack gap="4" width="320px">
      <Stack gap="1">
        <Text variant="overline">truncate (single line)</Text>
        <Text truncate>
          A very long single-line string that will overflow the container and be cut with an
          ellipsis.
        </Text>
      </Stack>
      <Stack gap="1">
        <Text variant="overline">truncate=&#123;2&#125;</Text>
        <Text truncate={2}>
          Multi-line clamp at two lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </Stack>
      <Stack gap="1">
        <Text variant="overline">truncate=&#123;4&#125;</Text>
        <Text truncate={4}>
          Four-line clamp, useful for article previews. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
          enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat.
        </Text>
      </Stack>
    </Stack>
  ),
};

// ── Responsive size ──────────────────────────────────────────────────

export const Responsive: Story = {
  render: () => (
    <Stack gap="2">
      <Text color="fg.muted">
        Resize the viewport &mdash; size steps <code>sm</code> → <code>lg</code> → <code>xl</code>.
      </Text>
      <Text size={{ base: 'sm', md: 'lg', xl: 'xl' }}>Responsive body size</Text>
      <Text
        size={{ base: 'sm', md: 'md', lg: 'lg' }}
        weight={{ base: 'regular', md: 'semibold' }}
        align={{ base: 'start', md: 'center' }}
      >
        Size, weight, and align all accept responsive values.
      </Text>
    </Stack>
  ),
};

// ── Polymorphic `as` ─────────────────────────────────────────────────

export const PolymorphicAs: Story = {
  render: () => (
    <Stack gap="2">
      <Text as="p">as=&quot;p&quot; &mdash; renders a paragraph</Text>
      <Text as="strong" weight="bold">
        as=&quot;strong&quot; &mdash; semantic emphasis
      </Text>
      <Text as="em" italic>
        as=&quot;em&quot; &mdash; emphasised
      </Text>
      <Text as="label" weight="semibold">
        as=&quot;label&quot; &mdash; for form fields
      </Text>
    </Stack>
  ),
};

// ── Realistic: card content ──────────────────────────────────────────

export const InCard: Story = {
  name: 'In a card',
  render: () => (
    <Box
      padding="4"
      background="bg.surface"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      boxShadow="sm"
      maxWidth="360px"
    >
      <Stack gap="2">
        <Text variant="overline">BREAKING</Text>
        <Heading level={3} size="lg" truncate={2}>
          A new era of composable design systems arrives this year
        </Heading>
        <Text color="fg.muted" truncate={3}>
          Open-source libraries are fragmenting into smaller, more composable parts — and that trend
          is shaping how teams approach their internal systems.
        </Text>
        <Inline gap="2" align="center" paddingTop="2">
          <Text size="sm" color="fg.subtle">
            5 min read
          </Text>
          <Text size="sm" color="fg.subtle">
            &middot;
          </Text>
          <Text size="sm" color="fg.subtle">
            Apr 17, 2026
          </Text>
        </Inline>
      </Stack>
    </Box>
  ),
};
