import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../primitives/layout/Box/Box.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../Heading/Heading.js';
import { Text } from '../Text/Text.js';
import { Link } from './Link.js';

const meta: Meta<typeof Link> = {
  title: 'Typography/Link',
  component: Link,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'subtle', 'emphasis'] },
    underline: { control: 'select', options: ['always', 'hover', 'none'] },
    external: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Link>;

export const Playground: Story = {
  args: {
    href: '#',
    variant: 'default',
    underline: 'hover',
    children: 'Read the docs',
  },
};

// ── Variants ──────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <Stack gap="2">
      <Link href="#">default — body-weight accent link</Link>
      <Link href="#" variant="subtle">
        subtle — muted foreground for low-emphasis references
      </Link>
      <Link href="#" variant="emphasis">
        emphasis — stronger weight for call-out links
      </Link>
    </Stack>
  ),
};

// ── Underline modes ───────────────────────────────────────────────────

export const Underlines: Story = {
  render: () => (
    <Stack gap="2">
      <Link href="#" underline="always">
        always underlined
      </Link>
      <Link href="#" underline="hover">
        underline on hover (default)
      </Link>
      <Link href="#" underline="none">
        never underlined
      </Link>
    </Stack>
  ),
};

// ── External ──────────────────────────────────────────────────────────

export const External: Story = {
  render: () => (
    <Stack gap="2">
      <Text>
        Read more about the spec on{' '}
        <Link href="https://www.w3.org/TR/WCAG22/" external>
          W3C&rsquo;s WCAG 2.2
        </Link>{' '}
        or check{' '}
        <Link href="https://example.com" external variant="emphasis">
          the MDN primer
        </Link>
        .
      </Text>
      <Text size="sm" color="fg.muted">
        The <code>external</code> flag adds <code>target=&quot;_blank&quot;</code> +{' '}
        <code>rel=&quot;noopener noreferrer&quot;</code> and a trailing chevron icon.
      </Text>
    </Stack>
  ),
};

// ── Download ──────────────────────────────────────────────────────────

export const Download: Story = {
  render: () => (
    <Stack gap="2">
      <Link href="/brand-guidelines.pdf" download>
        Download brand guidelines (PDF)
      </Link>
      <Link href="/report.csv" download="cynosure-report.csv" variant="emphasis">
        Download monthly report (CSV)
      </Link>
    </Stack>
  ),
};

// ── Disabled ──────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Stack gap="2">
      <Link href="/admin" disabled>
        Disabled link
      </Link>
      <Text size="sm" color="fg.muted">
        Clicks are blocked and <code>aria-disabled=&quot;true&quot;</code> is set.
      </Text>
    </Stack>
  ),
};

// ── In prose ──────────────────────────────────────────────────────────

export const InProse: Story = {
  render: () => (
    <Stack gap="3" maxWidth="prose">
      <Heading level={3}>The Web is hyperlinked</Heading>
      <Text>
        Much of the web&rsquo;s value comes from its <Link href="#">hyperlinked nature</Link>. Good
        links are scannable — verbs first, destinations implied. Avoid the anti-pattern of{' '}
        <Link href="#">click here</Link> or{' '}
        <Link href="#" variant="subtle">
          read more
        </Link>
        . Instead, link the phrase the reader would use to describe the destination, like the{' '}
        <Link href="#" variant="emphasis">
          Cynosure documentation
        </Link>
        .
      </Text>
    </Stack>
  ),
};

// ── Long URL wrapping ────────────────────────────────────────────────

export const LongUrlWrap: Story = {
  render: () => (
    <Stack gap="2" width="320px">
      <Text>
        Visit{' '}
        <Link
          href="https://example.com/very/long/url/that/will/need/to/wrap/onto/multiple/lines/when/the/container/is/narrow"
          style={{ wordBreak: 'break-all' }}
        >
          https://example.com/very/long/url/that/will/need/to/wrap/onto/multiple/lines/when/the/container/is/narrow
        </Link>{' '}
        for details.
      </Text>
    </Stack>
  ),
};

// ── List of links ────────────────────────────────────────────────────

export const NavigationList: Story = {
  name: 'In a navigation list',
  render: () => (
    <Box
      padding="3"
      background="bg.surface"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      width="260px"
    >
      <Stack gap="1">
        <Text variant="overline">Documentation</Text>
        <Link href="#overview" variant="subtle" underline="none">
          Overview
        </Link>
        <Link href="#install" variant="subtle" underline="none">
          Installation
        </Link>
        <Link href="#theming" variant="subtle" underline="none">
          Theming
        </Link>
        <Link href="#primitives" variant="subtle" underline="none">
          Primitives
        </Link>
        <Link href="#components" variant="subtle" underline="none">
          Components
        </Link>
        <Link href="https://github.com/cynosure" external underline="none">
          GitHub
        </Link>
      </Stack>
    </Box>
  ),
};

// ── Inline list separator ────────────────────────────────────────────

export const InlineActions: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Link href="#">Edit</Link>
      <Text color="fg.muted">·</Text>
      <Link href="#" variant="emphasis">
        Duplicate
      </Link>
      <Text color="fg.muted">·</Text>
      <Link href="#" variant="subtle">
        View history
      </Link>
    </Inline>
  ),
};
