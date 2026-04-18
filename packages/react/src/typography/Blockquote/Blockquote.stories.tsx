import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../primitives/layout/Box/Box.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../Heading/Heading.js';
import { Link } from '../Link/Link.js';
import { Text } from '../Text/Text.js';
import { Blockquote } from './Blockquote.js';

const meta: Meta<typeof Blockquote> = {
  title: 'Typography/Blockquote',
  component: Blockquote,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'callout'] },
  },
};
export default meta;
type Story = StoryObj<typeof Blockquote>;

export const Playground: Story = {
  args: { variant: 'default', attribution: 'Tim Berners-Lee' },
  render: (args) => (
    <Blockquote {...args}>The Web is more a social creation than a technical one.</Blockquote>
  ),
};

// ── Basic ─────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Blockquote>
      The best way to predict the future is to invent it. The second best way is to ship good
      defaults and let the community adapt the rest.
    </Blockquote>
  ),
};

// ── With attribution ──────────────────────────────────────────────────

export const WithAttribution: Story = {
  render: () => (
    <Blockquote attribution="Tim Berners-Lee, inventor of the World Wide Web">
      The Web is more a social creation than a technical one. I designed it for a social effect — to
      help people work together — and not as a technical toy.
    </Blockquote>
  ),
};

// ── Callout variant ───────────────────────────────────────────────────

export const Callout: Story = {
  render: () => (
    <Blockquote variant="callout" attribution="Design principle">
      Every non-primitive component composes Box. No raw JSX elements in component bodies.
    </Blockquote>
  ),
};

// ── Variants side by side ─────────────────────────────────────────────

export const VariantsCompared: Story = {
  render: () => (
    <Stack gap="4" maxWidth="prose">
      <Stack gap="2">
        <Text variant="overline">variant=&quot;default&quot;</Text>
        <Blockquote>Good design is obvious. Great design is transparent.</Blockquote>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">variant=&quot;callout&quot;</Text>
        <Blockquote variant="callout">
          Good design is obvious. Great design is transparent.
        </Blockquote>
      </Stack>
    </Stack>
  ),
};

// ── Rich attribution ──────────────────────────────────────────────────

export const RichAttribution: Story = {
  render: () => (
    <Blockquote
      attribution={
        <>
          <Text weight="semibold">Jane Doe</Text>
          {' · '}
          <Link href="https://example.com" external>
            Source
          </Link>
        </>
      }
    >
      Constraints are the secret weapon of elegant APIs. A tiny surface forces composition over
      configuration.
    </Blockquote>
  ),
};

// ── Nested blockquotes ────────────────────────────────────────────────

export const Nested: Story = {
  render: () => (
    <Blockquote attribution="Alex — responding">
      <Text>I was reading this earlier and had to share:</Text>
      <Blockquote variant="callout" attribution="Original author">
        The simplest explanation is usually the correct one.
      </Blockquote>
      <Text>&mdash; which is exactly what I was trying to get at.</Text>
    </Blockquote>
  ),
};

// ── In a blog article context ─────────────────────────────────────────

export const InArticle: Story = {
  name: 'In a blog article',
  render: () => (
    <Stack gap="4" maxWidth="prose">
      <Heading level={1} size="3xl">
        A note on writing
      </Heading>
      <Text color="fg.muted">Aug 14, 2026 · 4 min read</Text>
      <Text>
        There&rsquo;s a common adage that goes around in engineering circles. It&rsquo;s one of
        those quotes that initially feels obvious, but rewards re-reading:
      </Text>
      <Blockquote variant="callout" attribution="Ernest Hemingway">
        Write drunk, edit sober.
      </Blockquote>
      <Text>
        The lesson isn&rsquo;t about alcohol, of course — it&rsquo;s about mode-switching. Drafting
        mode is a different cognitive task than editing mode, and trying to do both at once produces
        muddled work.
      </Text>
    </Stack>
  ),
};

// ── With muted frame ──────────────────────────────────────────────────

export const Styled: Story = {
  render: () => (
    <Box
      padding="5"
      background="bg.subtle"
      borderRadius="lg"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      maxWidth="520px"
    >
      <Blockquote variant="callout" attribution="Product review, 2026">
        Cynosure changed the way our design team works with engineers. Tokens align first —
        everything else follows.
      </Blockquote>
    </Box>
  ),
};
