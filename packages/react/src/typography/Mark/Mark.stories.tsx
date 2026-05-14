import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../primitives/layout/Box/Box.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../Heading/Heading.js';
import { Text } from '../Text/Text.js';
import { HighlightedText, Mark } from './Mark.js';

const meta: Meta<typeof Mark> = {
  title: 'Typography/Mark',
  component: Mark,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['marker', 'underline', 'chip', 'bold'] },
    colorScheme: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'danger', 'info', 'neutral'],
    },
    intensity: { control: 'select', options: ['subtle', 'solid'] },
    as: { control: 'select', options: ['mark', 'span'] },
  },
};
export default meta;
type Story = StoryObj<typeof Mark>;

export const Playground: Story = {
  args: {
    variant: 'marker',
    colorScheme: 'warning',
    intensity: 'subtle',
    children: 'highlighted',
  },
  render: (args) => (
    <Text>
      The quick brown <Mark {...args} /> fox jumps over the lazy dog.
    </Text>
  ),
};

// ── Variants ─────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <Stack gap="3" maxWidth="prose">
      <Text>
        marker — the <Mark variant="marker">highlighted</Mark> phrase.
      </Text>
      <Text>
        underline — the <Mark variant="underline">highlighted</Mark> phrase.
      </Text>
      <Text>
        chip — the <Mark variant="chip">highlighted</Mark> phrase.
      </Text>
      <Text>
        bold — the <Mark variant="bold">highlighted</Mark> phrase.
      </Text>
    </Stack>
  ),
};

// ── Color schemes ────────────────────────────────────────────────────

export const ColorSchemes: Story = {
  render: () => (
    <Stack gap="2">
      <Text>
        accent <Mark colorScheme="accent">value</Mark>, success{' '}
        <Mark colorScheme="success">value</Mark>, warning <Mark colorScheme="warning">value</Mark>,
        danger <Mark colorScheme="danger">value</Mark>, info <Mark colorScheme="info">value</Mark>,
        neutral <Mark colorScheme="neutral">value</Mark>.
      </Text>
    </Stack>
  ),
};

// ── Intensities ──────────────────────────────────────────────────────

export const Intensities: Story = {
  render: () => (
    <Stack gap="3">
      <Text>
        subtle <Mark intensity="subtle">amber</Mark> / solid <Mark intensity="solid">amber</Mark>
      </Text>
      <Text>
        subtle{' '}
        <Mark colorScheme="danger" intensity="subtle">
          red
        </Mark>{' '}
        / solid{' '}
        <Mark colorScheme="danger" intensity="solid">
          red
        </Mark>
      </Text>
    </Stack>
  ),
};

// ── Multi-line wrap ──────────────────────────────────────────────────

export const MultiLineWrap: Story = {
  name: 'Wraps cleanly across lines',
  render: () => (
    <Box maxWidth="320px">
      <Text>
        Cynosure exposes a <Mark>thin inline-flow primitive that wraps text in a styled mark</Mark>{' '}
        — and the highlight wraps with the line, with padding and rounded corners painted on every
        line.
      </Text>
    </Box>
  ),
};

// ── HighlightedText: regex matches ───────────────────────────────────

const REGEX_SOURCE = 'the quick brown fox jumps over the lazy dog';
const QUICK_RE = /\bthe\b|quick|lazy/gi;

function findRanges(text: string, re: RegExp): { start: number; length: number }[] {
  const out: { start: number; length: number }[] = [];
  for (const m of text.matchAll(re)) {
    if (m.index != null) out.push({ start: m.index, length: m[0].length });
  }
  return out;
}

export const HighlightedTextRegex: Story = {
  name: 'HighlightedText — regex matches',
  render: () => (
    <Stack gap="3" maxWidth="prose">
      <Heading level={3} size="md">
        Pattern: <code>{String(QUICK_RE)}</code>
      </Heading>
      <Text>
        <HighlightedText text={REGEX_SOURCE} ranges={findRanges(REGEX_SOURCE, QUICK_RE)} />
      </Text>
    </Stack>
  ),
};

// ── Diff-style chip variant ──────────────────────────────────────────

export const DiffHunks: Story = {
  render: () => (
    <Stack gap="2" maxWidth="prose">
      <Text>
        Replaced{' '}
        <Mark variant="chip" colorScheme="danger">
          getCwd()
        </Mark>{' '}
        with{' '}
        <Mark variant="chip" colorScheme="success">
          getCurrentWorkingDirectory()
        </Mark>{' '}
        across the repo.
      </Text>
    </Stack>
  ),
};

// ── Bold (syntax) variant ────────────────────────────────────────────

export const SyntaxBold: Story = {
  render: () => (
    <Text>
      <Mark variant="bold" colorScheme="accent">
        const
      </Mark>{' '}
      <Mark variant="bold" colorScheme="neutral">
        x
      </Mark>{' '}
      ={' '}
      <Mark variant="bold" colorScheme="success">
        42
      </Mark>
      {';'}
    </Text>
  ),
};

// ── Validation pointer ───────────────────────────────────────────────

const EMAIL = 'arshad@cynsure..dev';

export const FormValidation: Story = {
  render: () => (
    <Stack gap="2" maxWidth="prose">
      <Text>The email looks malformed — check the domain:</Text>
      <Text as="span">
        <HighlightedText
          text={EMAIL}
          ranges={[{ start: EMAIL.indexOf('..'), length: 2 }]}
          variant="underline"
          colorScheme="danger"
          intensity="solid"
          title="Double dot — invalid in the domain"
        />
      </Text>
    </Stack>
  ),
};

// ── Inline alongside Badge for contrast ──────────────────────────────

export const NextToBadge: Story = {
  render: () => (
    <Inline gap="2" align="center">
      <Text>
        Status:{' '}
        <Mark variant="chip" colorScheme="success" intensity="solid">
          passing
        </Mark>{' '}
        — flowed inline, no baseline jump.
      </Text>
    </Inline>
  ),
};
