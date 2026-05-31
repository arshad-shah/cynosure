import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  type DrawerSide,
  DrawerTitle,
  DrawerTrigger,
} from './Drawer.js';

const meta: Meta<typeof Drawer> = {
  title: 'Overlays/Drawer',
  component: Drawer,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
          <DrawerDescription>Recent activity in your workspace.</DrawerDescription>
        </DrawerHeader>
        <Stack gap="3" paddingX="5" paddingBottom="3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Stack key={`n-${i.toString()}`} gap="1">
              <Text size="sm" weight="medium">
                Build #{1200 + i} completed
              </Text>
              <Text size="xs" color="fg.muted">
                {i + 1}m ago
              </Text>
            </Stack>
          ))}
        </Stack>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Sides: Story = {
  render: () => (
    <Inline gap="3" wrap>
      {(['top', 'right', 'bottom', 'left'] as DrawerSide[]).map((side) => (
        <Drawer key={side}>
          <DrawerTrigger asChild>
            <Button variant="outline">side={side}</Button>
          </DrawerTrigger>
          <DrawerContent side={side}>
            <DrawerHeader>
              <DrawerTitle>Anchored to the {side}</DrawerTitle>
              <DrawerDescription>
                Drawers slide in from the edge specified by <code>side</code>.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="3" wrap>
      {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
        <Drawer key={size}>
          <DrawerTrigger asChild>
            <Button variant="outline">size={size}</Button>
          </DrawerTrigger>
          <DrawerContent side="right" size={size}>
            <DrawerHeader>
              <DrawerTitle>Size: {size}</DrawerTitle>
              <DrawerDescription>
                For left/right drawers, <code>size</code> sets the width; for top/bottom it sets the
                height.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </Inline>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · trigger opens, Escape closes',
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
          <DrawerDescription>Recent activity in your workspace.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open drawer' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    // Content portals to document.body, so query the whole screen.
    const drawer = await within(document.body).findByRole('dialog');
    await expect(drawer).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};
