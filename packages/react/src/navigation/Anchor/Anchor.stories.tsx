import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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

export const Interaction: Story = {
  name: 'Interaction · link href + clicking sets the hash',
  render: () => <Anchor id="introduction">Introduction</Anchor>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The heading carries the id used as the fragment target.
    const heading = canvas.getByRole('heading', { name: /Introduction/ });
    await expect(heading).toHaveAttribute('id', 'introduction');

    const link = canvas.getByRole('link', { name: 'Copy link to section' });
    await expect(link).toHaveAttribute('href', '#introduction');

    await userEvent.click(link);
    // Clicking pushes the fragment into the address bar without a full nav.
    await waitFor(() => {
      expect(window.location.hash).toBe('#introduction');
    });
  },
};
