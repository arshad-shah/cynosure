import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useState } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Code } from '../../typography/Code/Code.js';
import { Text } from '../../typography/Text/Text.js';
import { Anchor } from './Anchor.js';

const meta: Meta<typeof Anchor> = {
  title: 'Navigation/Anchor',
  component: Anchor,
  parameters: { layout: 'padded' },
  argTypes: {
    level: { control: { type: 'select' }, options: [1, 2, 3, 4, 5, 6] },
  },
};
export default meta;
type Story = StoryObj<typeof Anchor>;

export const Default: Story = {
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        Hover the heading — a link icon reveals. Click to copy the URL fragment.
      </Text>
      <Anchor id="introduction">Introduction</Anchor>
    </Stack>
  ),
};

export const AllLevels: Story = {
  name: 'All heading levels',
  render: () => (
    <Stack gap="4">
      <Anchor id="h1-example" level={1}>
        Heading 1
      </Anchor>
      <Anchor id="h2-example" level={2}>
        Heading 2
      </Anchor>
      <Anchor id="h3-example" level={3}>
        Heading 3
      </Anchor>
      <Anchor id="h4-example" level={4}>
        Heading 4
      </Anchor>
      <Anchor id="h5-example" level={5}>
        Heading 5
      </Anchor>
      <Anchor id="h6-example" level={6}>
        Heading 6
      </Anchor>
    </Stack>
  ),
};

export const HoverReveal: Story = {
  name: 'Hover / focus reveal',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        The link stays hidden until you hover the heading or tab through to it via keyboard.
      </Text>
      <Anchor id="reveal-demo" level={2}>
        Getting started
      </Anchor>
      <Text size="sm" color="fg.muted">
        Tab ↹ the page to see the link focus-revealed.
      </Text>
    </Stack>
  ),
};

export const InsideCodeBlock: Story = {
  name: 'Heading with inline code',
  render: () => (
    <Stack gap="4">
      <Anchor id="installation" level={2}>
        Installation with <Code>pnpm</Code>
      </Anchor>
      <Anchor id="use-theme-hook" level={3}>
        The <Code>useTheme()</Code> hook
      </Anchor>
      <Anchor id="button-api" level={3}>
        <Code>&lt;Button&gt;</Code> props
      </Anchor>
    </Stack>
  ),
};

export const WithOffsetTop: Story = {
  name: 'offsetTop — compensate for sticky headers',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        Use <Code>offsetTop</Code> when a sticky header would otherwise overlap the target.
      </Text>
      <Anchor id="offset-80" offsetTop={80} level={2}>
        Pinned to a 80px sticky header
      </Anchor>
      <Anchor id="offset-rem" offsetTop="4rem" level={3}>
        offsetTop accepts any CSS length
      </Anchor>
    </Stack>
  ),
};

export const OnCopyCallback: Story = {
  name: 'onCopy — toast after copy',
  render: () => {
    function Demo(): ReactElement {
      const [copied, setCopied] = useState<string | null>(null);
      const notify = (id: string) => {
        setCopied(id);
        window.setTimeout(() => setCopied(null), 1800);
      };
      return (
        <Stack gap="4">
          <Text size="sm" color="fg.muted">
            Click the link icon — a mini-toast confirms the copy.
          </Text>
          <Anchor id="accent-tokens" level={2} onCopy={() => notify('accent-tokens')}>
            Accent tokens
          </Anchor>
          <Anchor id="neutral-tokens" level={2} onCopy={() => notify('neutral-tokens')}>
            Neutral tokens
          </Anchor>
          {copied ? (
            <Text size="sm" color="accent.solid">
              Copied #{copied} to the clipboard.
            </Text>
          ) : null}
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const LongHeading: Story = {
  name: 'Edge — very long heading wraps',
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Anchor id="long-heading" level={2}>
        A long heading that wraps onto multiple lines while keeping the copy-link icon aligned with
        the text flow
      </Anchor>
    </div>
  ),
};

export const DocsUseCase: Story = {
  name: 'Use case — docs page',
  render: () => (
    <Stack gap="5" style={{ maxWidth: 640 }}>
      <Anchor id="overview" level={1}>
        Tabs
      </Anchor>
      <Text>
        A set of layered sections of content—known as tab panels—that are displayed one at a time.
      </Text>
      <Anchor id="installation" level={2}>
        Installation
      </Anchor>
      <Text>
        Install the package with your preferred package manager and import the components.
      </Text>
      <Anchor id="anatomy" level={2}>
        Anatomy
      </Anchor>
      <Text>Import all parts and piece them together.</Text>
      <Anchor id="accessibility" level={2}>
        Accessibility
      </Anchor>
      <Text>Adheres to the Tabs WAI-ARIA design pattern.</Text>
      <Anchor id="api-reference" level={2}>
        API reference
      </Anchor>
      <Anchor id="api-root" level={3}>
        Root
      </Anchor>
      <Anchor id="api-list" level={3}>
        List
      </Anchor>
      <Anchor id="api-trigger" level={3}>
        Trigger
      </Anchor>
    </Stack>
  ),
};

export const CustomLabel: Story = {
  render: () => (
    <Anchor id="custom-label" level={2} label="Kopiëren van sectielink">
      Een sectie met een Nederlandse label (i18n)
    </Anchor>
  ),
};
