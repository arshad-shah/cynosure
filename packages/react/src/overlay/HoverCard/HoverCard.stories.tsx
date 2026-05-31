import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Link } from '../../typography/Link/Link.js';
import { Text } from '../../typography/Text/Text.js';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './HoverCard.js';

const meta: Meta<typeof HoverCard> = {
  title: 'Overlays/HoverCard',
  component: HoverCard,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <Text size="md">
      Hover over{' '}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link href="#">@cynosure</Link>
        </HoverCardTrigger>
        <HoverCardContent>
          <Stack gap="2" padding="4" minWidth="260px">
            <Heading level={4} size="sm">
              Cynosure UI
            </Heading>
            <Text size="sm" color="fg.muted">
              A tokens-first React design system for Anthropic surfaces.
            </Text>
          </Stack>
        </HoverCardContent>
      </HoverCard>{' '}
      to reveal the card.
    </Text>
  ),
};

export const UserMention: Story = {
  name: 'User mention card',
  render: () => (
    <Text size="md">
      Assigned to{' '}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link href="#">@alex</Link>
        </HoverCardTrigger>
        <HoverCardContent>
          <Stack gap="3" padding="4" minWidth="280px">
            <Inline gap="3" align="center">
              <Stack
                width="44px"
                height="44px"
                borderRadius="full"
                background="accent.soft"
                align="center"
                justify="center"
              >
                <Text weight="semibold">AL</Text>
              </Stack>
              <Stack gap="0">
                <Text size="sm" weight="semibold">
                  Alex Lane
                </Text>
                <Text size="xs" color="fg.muted">
                  Design systems lead
                </Text>
              </Stack>
            </Inline>
            <Text size="sm">
              Works on tokens, primitives, and the overlay system. Based in Dublin.
            </Text>
            <Inline gap="4">
              <Text size="xs" color="fg.muted">
                <strong>128</strong> PRs
              </Text>
              <Text size="xs" color="fg.muted">
                <strong>42</strong> issues
              </Text>
            </Inline>
          </Stack>
        </HoverCardContent>
      </HoverCard>{' '}
      for review.
    </Text>
  ),
};

export const Placements: Story = {
  render: () => (
    <Stack gap="4">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Inline key={side} gap="3" align="center">
          <Text size="sm" color="fg.muted" width="80px">
            side={side}
          </Text>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" size="sm">
                Hover me
              </Button>
            </HoverCardTrigger>
            <HoverCardContent side={side}>
              <Stack gap="1" padding="3" minWidth="180px">
                <Text size="sm" weight="medium">
                  Card on {side}
                </Text>
                <Text size="xs" color="fg.muted">
                  Opened on hover / focus.
                </Text>
              </Stack>
            </HoverCardContent>
          </HoverCard>
        </Inline>
      ))}
    </Stack>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline">With arrow</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <Stack gap="2" minWidth="220px">
          <Text size="sm" weight="medium">
            Arrowed hover card
          </Text>
          <Text size="xs" color="fg.muted">
            <code>HoverCardContent</code> renders a side-aware caret aimed at the trigger by default
            (<code>withArrow</code>).
          </Text>
        </Stack>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · hover opens, unhover closes',
  render: () => (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <Stack gap="1" padding="3" minWidth="180px">
          <Text size="sm" weight="medium">
            Revealed on hover
          </Text>
          <Text size="xs" color="fg.muted">
            Pointer-driven, non-modal context.
          </Text>
        </Stack>
      </HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });
    await userEvent.hover(trigger);
    const card = await within(document.body).findByRole('dialog');
    await expect(card).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() =>
      expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};
