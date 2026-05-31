import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Tooltip, TooltipProvider } from './Tooltip.js';

const meta: Meta<typeof Tooltip> = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={300} skipDelayDuration={200}>
        <Story />
      </TooltipProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip content="Saves your changes">
      <Button>Save</Button>
    </Tooltip>
  ),
};

export const Placements: Story = {
  name: 'All sides',
  render: () => (
    <Stack gap="4" padding="6">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Inline key={side} gap="3" align="center">
          <Text size="sm" color="fg.muted" width="80px">
            side={side}
          </Text>
          <Tooltip content={`Tip on the ${side}`} side={side}>
            <Button variant="outline" size="sm">
              Hover
            </Button>
          </Tooltip>
        </Inline>
      ))}
    </Stack>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Tooltip
      content={
        <Stack gap="1">
          <Text size="sm" weight="semibold">
            Keyboard shortcut
          </Text>
          <Text size="xs">
            Press <kbd>⌘K</kbd> to open the command palette.
          </Text>
        </Stack>
      }
    >
      <Button variant="outline">Commands</Button>
    </Tooltip>
  ),
};

export const WithoutArrow: Story = {
  render: () => (
    <Inline gap="3">
      <Tooltip content="With arrow (default)">
        <Button variant="outline">With</Button>
      </Tooltip>
      <Tooltip content="Without arrow" withArrow={false}>
        <Button variant="outline">Without</Button>
      </Tooltip>
    </Inline>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · focus shows the tip, Escape hides it',
  render: () => (
    <Tooltip content="Saves your changes" delayMs={0}>
      <Button>Save</Button>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Save' });
    trigger.focus();
    // The tip portals to document.body and is referenced via aria-describedby.
    const tip = await within(document.body).findByRole('tooltip');
    await expect(tip).toHaveTextContent('Saves your changes');
    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).queryByRole('tooltip')).not.toBeInTheDocument();
  },
};
