import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../primitives/layout/Box/Box.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../Heading/Heading.js';
import { Kbd } from '../Kbd/Kbd.js';
import { Link } from '../Link/Link.js';
import { Text } from '../Text/Text.js';
import { Code } from './Code.js';

const meta: Meta<typeof Code> = {
  title: 'Typography/Code',
  component: Code,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    variant: { control: 'select', options: ['inline', 'block'] },
    colorScheme: {
      control: 'select',
      options: ['neutral', 'accent', 'success', 'danger'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Code>;

export const Playground: Story = {
  args: { size: 'md', variant: 'inline', colorScheme: 'neutral', children: 'npm install' },
};

// ── Inline in prose ───────────────────────────────────────────────────

export const InlineInProse: Story = {
  render: () => (
    <Stack gap="3" maxWidth="prose">
      <Text>
        Install with <Code>pnpm add @arshad-shah/cynosure-react</Code> and import what you need from{' '}
        <Code colorScheme="accent">&quot;@arshad-shah/cynosure-react&quot;</Code>. The{' '}
        <Code>Box</Code> primitive is the foundation — every other primitive composes it.
      </Text>
      <Text>
        Need to override a style? Reach for <Code>className</Code> or <Code>style</Code>, though
        token props (<Code>padding</Code>, <Code>background</Code>) should cover 90% of cases.
      </Text>
    </Stack>
  ),
};

// ── Sizes ─────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      <Text size="sm">
        Small body with <Code size="sm">size=&quot;sm&quot;</Code> inline code keeps type rhythm.
      </Text>
      <Text>
        Medium body with <Code size="md">size=&quot;md&quot;</Code> (default) is the most common.
      </Text>
    </Stack>
  ),
};

// ── Color schemes ─────────────────────────────────────────────────────

export const ColorSchemes: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="3" align="center">
        <Code colorScheme="neutral">neutral</Code>
        <Code colorScheme="accent">accent</Code>
        <Code colorScheme="success">success</Code>
        <Code colorScheme="danger">danger</Code>
      </Inline>
      <Text>
        Use <Code colorScheme="success">200 OK</Code> for healthy states and{' '}
        <Code colorScheme="danger">500 INTERNAL_ERROR</Code> for failures. Default to{' '}
        <Code>neutral</Code> everywhere else.
      </Text>
    </Stack>
  ),
};

// ── Block ─────────────────────────────────────────────────────────────

export const Block: Story = {
  render: () => (
    <Stack gap="4" maxWidth="prose">
      <Text>A block code snippet preserves whitespace and renders as a styled pre/code pair.</Text>
      <Code variant="block">
        {`import { Button, Stack } from '@arshad-shah/cynosure-react';

export function CallToAction() {
  return (
    <Stack gap="3">
      <Button>Get started</Button>
      <Button variant="outline">Learn more</Button>
    </Stack>
  );
}`}
      </Code>
    </Stack>
  ),
};

// ── Block with long line overflow ─────────────────────────────────────

export const BlockOverflow: Story = {
  name: 'Block — wide snippet with horizontal scroll',
  render: () => (
    <Box maxWidth="520px">
      <Code variant="block">
        {`const handler = await fetch('https://api.cynosure.dev/v1/projects/12345?include=members,settings,billing&expand=all', { headers });`}
      </Code>
    </Box>
  ),
};

// ── With Kbd ──────────────────────────────────────────────────────────

export const WithKbd: Story = {
  render: () => (
    <Stack gap="3">
      <Text>
        In the shell, hit <Kbd>Ctrl</Kbd>+<Kbd>C</Kbd> to copy <Code>git status</Code> output, then
        paste with <Kbd>Ctrl</Kbd>+<Kbd>V</Kbd>.
      </Text>
      <Text>
        From anywhere: press <Kbd>⌘</Kbd>+<Kbd>K</Kbd> and type{' '}
        <Code colorScheme="accent">:rebuild</Code> to trigger a fresh build.
      </Text>
    </Stack>
  ),
};

// ── Realistic: API reference snippet ──────────────────────────────────

export const ApiReference: Story = {
  render: () => (
    <Stack gap="4" maxWidth="prose">
      <Heading level={2}>Button</Heading>
      <Text>
        The <Code>Button</Code> component accepts a <Code colorScheme="accent">variant</Code> prop (
        <Code>
          &apos;solid&apos; | &apos;soft&apos; | &apos;outline&apos; | &apos;ghost&apos; |
          &apos;link&apos;
        </Code>
        ).
      </Text>
      <Code variant="block" size="sm">
        {`<Button variant="solid" colorScheme="accent" size="md">
  Continue
</Button>`}
      </Code>
      <Text size="sm" color="fg.muted">
        Read the full API at{' '}
        <Link href="https://cynosure.dev" external>
          cynosure.dev
        </Link>
        .
      </Text>
    </Stack>
  ),
};

// ── Error / success / warning messages ────────────────────────────────

export const StatusCodes: Story = {
  render: () => (
    <Stack gap="2">
      <Text>
        <Code colorScheme="success">✓</Code> Build succeeded in <Code>12.4s</Code>.
      </Text>
      <Text>
        <Code colorScheme="danger">✗</Code> Failed: <Code colorScheme="danger">ENOENT</Code>: no
        such file or directory, open <Code>&apos;./missing.json&apos;</Code>
      </Text>
    </Stack>
  ),
};
