import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../primitives/layout/Box/Box.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../Text/Text.js';
import { Heading } from './Heading.js';

const meta: Meta<typeof Heading> = {
  title: 'Typography/Heading',
  component: Heading,
  parameters: { layout: 'padded' },
  argTypes: {
    level: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
    },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold', 'bold'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
};
export default meta;
type Story = StoryObj<typeof Heading>;

export const Playground: Story = {
  args: {
    level: 1,
    children: 'The quick brown fox jumps over the lazy dog',
  },
};

// ── Semantic levels (default sizes) ───────────────────────────────────

export const Levels: Story = {
  render: () => (
    <Stack gap="3">
      <Heading level={1}>h1 &mdash; Page title</Heading>
      <Heading level={2}>h2 &mdash; Section</Heading>
      <Heading level={3}>h3 &mdash; Subsection</Heading>
      <Heading level={4}>h4 &mdash; Sub-subsection</Heading>
      <Heading level={5}>h5 &mdash; Tight heading</Heading>
      <Heading level={6}>h6 &mdash; Label-sized</Heading>
    </Stack>
  ),
};

// ── Size ramp ─────────────────────────────────────────────────────────

export const SizeRamp: Story = {
  render: () => (
    <Stack gap="3">
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const).map((size) => (
        <Inline key={size} gap="3" align="baseline">
          <Text size="sm" color="fg.muted" style={{ minWidth: '40px' }}>
            {size}
          </Text>
          <Heading level={2} size={size}>
            The quick brown fox
          </Heading>
        </Inline>
      ))}
    </Stack>
  ),
};

// ── Decoupled level from size ─────────────────────────────────────────

export const LevelVsSize: Story = {
  name: 'Decoupled level ↔ size',
  render: () => (
    <Stack gap="4" maxWidth="prose">
      <Text color="fg.muted">
        Designers care about hierarchy; screen readers and SEO care about semantics. Set{' '}
        <code>level</code> for structure and <code>size</code> for looks — they are orthogonal.
      </Text>
      <Stack gap="3">
        <Heading level={1} size="xs">
          h1 rendered at body-xs (unusual but legal)
        </Heading>
        <Heading level={3} size="5xl">
          h3 rendered at 5xl (hero override)
        </Heading>
        <Heading level={2} size="md">
          h2 rendered at md (tight section label)
        </Heading>
      </Stack>
    </Stack>
  ),
};

// ── Weights ───────────────────────────────────────────────────────────

export const Weights: Story = {
  render: () => (
    <Stack gap="2">
      {(['regular', 'medium', 'semibold', 'bold'] as const).map((weight) => (
        <Heading key={weight} level={3} weight={weight}>
          weight=&quot;{weight}&quot; &mdash; The quick brown fox
        </Heading>
      ))}
    </Stack>
  ),
};

// ── Alignment ─────────────────────────────────────────────────────────

export const Alignment: Story = {
  render: () => (
    <Stack gap="3">
      <Heading level={3} align="start">
        align=&quot;start&quot;
      </Heading>
      <Heading level={3} align="center">
        align=&quot;center&quot;
      </Heading>
      <Heading level={3} align="end">
        align=&quot;end&quot;
      </Heading>
    </Stack>
  ),
};

// ── Truncation ────────────────────────────────────────────────────────

export const Truncation: Story = {
  render: () => (
    <Stack gap="4" width="320px">
      <Stack gap="1">
        <Text variant="overline">truncate (single line)</Text>
        <Heading level={3} size="lg" truncate>
          An extremely long heading that will be ellipsised at the edge of its container
        </Heading>
      </Stack>
      <Stack gap="1">
        <Text variant="overline">truncate=&#123;2&#125; (2-line clamp)</Text>
        <Heading level={3} size="md" truncate={2}>
          Multi-line clamp — wraps up to two lines and then truncates with an ellipsis when the
          content exceeds the line count. Great for card titles.
        </Heading>
      </Stack>
      <Stack gap="1">
        <Text variant="overline">truncate=&#123;3&#125;</Text>
        <Heading level={3} size="sm" truncate={3}>
          A three-line clamp is useful for article preview titles where a little more room is
          available but we still want to bound the height deterministically for consistent card
          sizes across a grid.
        </Heading>
      </Stack>
    </Stack>
  ),
};

// ── Responsive size ──────────────────────────────────────────────────

export const Responsive: Story = {
  render: () => (
    <Stack gap="2">
      <Text color="fg.muted">
        Resize the viewport — size steps base(<code>xl</code>) → md(<code>3xl</code>) → lg(
        <code>5xl</code>).
      </Text>
      <Heading level={1} size={{ base: 'xl', md: '3xl', lg: '5xl' }}>
        Responsive headline
      </Heading>
    </Stack>
  ),
};

// ── Semantic hierarchy ────────────────────────────────────────────────

export const SemanticHierarchy: Story = {
  name: 'Semantic hierarchy — article outline',
  render: () => (
    <Stack gap="4" maxWidth="prose">
      <Heading level={1}>Introduction to Lumen</Heading>
      <Text color="fg.muted">An opinionated set of primitives for building UI fast.</Text>

      <Heading level={2}>Philosophy</Heading>
      <Text>
        We start from tokens, compose primitives, and ship components that are boring in a good way.
      </Text>

      <Heading level={3}>Tokens first</Heading>
      <Text>Every value a designer cares about lives in the token layer.</Text>

      <Heading level={3}>Primitives next</Heading>
      <Text>A small set of primitives form the substrate for the rest of the system.</Text>

      <Heading level={2}>Getting started</Heading>
      <Text>Install the package and import the pieces you need.</Text>

      <Heading level={3}>Install</Heading>
      <Heading level={4}>Peer dependencies</Heading>
      <Text>React 19+, @lumen/tokens.</Text>
    </Stack>
  ),
};

// ── Color variations ─────────────────────────────────────────────────

export const ColorVariants: Story = {
  render: () => (
    <Stack gap="2">
      <Heading level={3} color="fg.default">
        fg.default
      </Heading>
      <Heading level={3} color="fg.muted">
        fg.muted
      </Heading>
      <Heading level={3} color="accent.solid">
        accent.solid
      </Heading>
      <Heading level={3} color="feedback.danger.foreground">
        feedback.danger.foreground
      </Heading>
      <Box padding="3" background="accent.solid" borderRadius="md">
        <Heading level={3} color="accent.onSolid">
          accent.onSolid on accent.solid background
        </Heading>
      </Box>
    </Stack>
  ),
};

// ── Long title wrap ──────────────────────────────────────────────────

export const LongTitle: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Heading level={1} size="3xl">
        A really long headline that will wrap across multiple lines on narrow viewports to show
        line-height rhythm
      </Heading>
      <Heading level={2} size="xl" align="center">
        Centred variation of a similarly long heading
      </Heading>
    </Stack>
  ),
};
