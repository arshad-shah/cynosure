import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
import { Input } from '../../forms/Input/Input.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { Popover, PopoverArrow, PopoverClose, PopoverContent, PopoverTrigger } from './Popover.js';

const meta: Meta<typeof Popover> = {
  title: 'Overlays/Popover',
  component: Popover,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Stack gap="2" padding="4" minWidth="240px">
          <Heading level={4} size="sm">
            Quick info
          </Heading>
          <Text size="sm" color="fg.muted">
            Popovers float next to their trigger and share non-modal context.
          </Text>
        </Stack>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  name: 'Form inside popover',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Rename</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Stack
          as="form"
          gap="3"
          padding="4"
          minWidth="280px"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Stack gap="1">
            <Text as="label" size="sm" weight="medium">
              New name
            </Text>
            <Input defaultValue="untitled-doc" autoFocus />
          </Stack>
          <Inline gap="2" justify="end">
            <PopoverClose asChild>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button size="sm" type="submit">
                Save
              </Button>
            </PopoverClose>
          </Inline>
        </Stack>
      </PopoverContent>
    </Popover>
  ),
};

export const Placements: Story = {
  name: 'Side + align combinations',
  render: () => (
    <Stack gap="4">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Inline key={side} gap="3" align="center">
          <Text size="sm" color="fg.muted" width="80px">
            side={side}
          </Text>
          {(['start', 'center', 'end'] as const).map((align) => (
            <Popover key={`${side}-${align}`}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {align}
                </Button>
              </PopoverTrigger>
              <PopoverContent side={side} align={align}>
                <Stack gap="1" padding="3" minWidth="160px">
                  <Text size="sm" weight="medium">
                    {side} / {align}
                  </Text>
                  <Text size="xs" color="fg.muted">
                    Placed relative to the trigger.
                  </Text>
                </Stack>
              </PopoverContent>
            </Popover>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">With arrow</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Stack gap="2" padding="4" minWidth="220px">
          <Text size="sm" weight="medium">
            Pointer arrow
          </Text>
          <Text size="xs" color="fg.muted">
            The <code>PopoverArrow</code> renders a caret anchored to the trigger.
          </Text>
        </Stack>
        <PopoverArrow />
      </PopoverContent>
    </Popover>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · click opens, Escape closes',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Stack gap="2" padding="4" minWidth="240px">
          <Heading level={4} size="sm">
            Quick info
          </Heading>
          <Text size="sm" color="fg.muted">
            Popovers float next to their trigger and trap focus while open.
          </Text>
        </Stack>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open popover' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    // Content portals to document.body, so query the whole screen.
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
  },
};
