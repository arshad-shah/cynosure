import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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

export const Alignments: Story = {
  name: 'Align variants',
  render: () => (
    <Inline gap="3">
      {(['start', 'center', 'end'] as const).map((align) => (
        <Tooltip key={align} content={`align=${align}`} side="bottom" align={align}>
          <Button variant="outline">{align}</Button>
        </Tooltip>
      ))}
    </Inline>
  ),
};

export const LongPressDelay: Story = {
  name: 'Custom delay (long-press)',
  render: () => (
    <Inline gap="3">
      <Tooltip content="Shows immediately" delayMs={0}>
        <Button variant="outline">delayMs = 0</Button>
      </Tooltip>
      <Tooltip content="Default 300ms">
        <Button variant="outline">Default</Button>
      </Tooltip>
      <Tooltip content="Only shows after 900ms" delayMs={900}>
        <Button variant="outline">delayMs = 900</Button>
      </Tooltip>
    </Inline>
  ),
};

export const MultipleTriggers: Story = {
  name: 'Row of triggers (share provider delay)',
  render: () => (
    <Inline gap="2">
      <Tooltip content="Align left">
        <Button variant="ghost" aria-label="Align left">
          ⬅
        </Button>
      </Tooltip>
      <Tooltip content="Align center">
        <Button variant="ghost" aria-label="Align center">
          ⬌
        </Button>
      </Tooltip>
      <Tooltip content="Align right">
        <Button variant="ghost" aria-label="Align right">
          ➡
        </Button>
      </Tooltip>
      <Tooltip content="Justify">
        <Button variant="ghost" aria-label="Justify">
          ≡
        </Button>
      </Tooltip>
    </Inline>
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

export const Disabled: Story = {
  name: 'Disabled tooltip',
  render: () => (
    <Inline gap="3" align="center">
      <Tooltip content="This tip will not show" disabled>
        <Button variant="outline">Disabled wrapper</Button>
      </Tooltip>
      <Text size="sm" color="fg.muted">
        When <code>disabled</code>, the Tooltip renders its child unwrapped.
      </Text>
    </Inline>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Inline gap="3" align="center">
          <Tooltip content="Controlled from outside" open={open} onOpenChange={setOpen}>
            <Button variant="outline">Target</Button>
          </Tooltip>
          <Button onClick={() => setOpen((o) => !o)}>{open ? 'Hide tip' : 'Show tip'}</Button>
        </Inline>
      );
    }
    return <Controlled />;
  },
};

export const NotAReplacementForLabel: Story = {
  name: 'Accessibility note',
  render: () => (
    <Stack gap="3" maxWidth="440px">
      <Text size="sm">
        Tooltips are secondary context. Icon-only buttons still need an accessible label (
        <code>aria-label</code> or visually hidden text); the tooltip augments, not replaces.
      </Text>
      <Inline gap="2">
        <Tooltip content="Delete">
          <Button variant="ghost" aria-label="Delete">
            🗑
          </Button>
        </Tooltip>
        <Tooltip content="Duplicate">
          <Button variant="ghost" aria-label="Duplicate">
            ⎘
          </Button>
        </Tooltip>
      </Inline>
    </Stack>
  ),
};
