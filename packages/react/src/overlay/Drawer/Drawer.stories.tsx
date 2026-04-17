import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Input } from '../../forms/Input/Input.js';
import { Textarea } from '../../forms/Textarea/Textarea.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
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

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Stack gap="3">
          <Inline gap="3" align="center">
            <Button onClick={() => setOpen(true)}>Open</Button>
            <Button variant="outline" onClick={() => setOpen((o) => !o)}>
              Toggle
            </Button>
            <Text size="sm" color="fg.muted">
              open: <strong>{String(open)}</strong>
            </Text>
          </Inline>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Controlled drawer</DrawerTitle>
                <DrawerDescription>
                  Owning the open state lets a parent orchestrate when the drawer appears (e.g., on
                  route change).
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const LongContent: Story = {
  name: 'Long content scrolls inside',
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open changelog</Button>
      </DrawerTrigger>
      <DrawerContent side="right" size="lg">
        <DrawerHeader>
          <DrawerTitle>Changelog</DrawerTitle>
          <DrawerDescription>Every shipped change, newest first.</DrawerDescription>
        </DrawerHeader>
        <Stack gap="4" paddingX="5" paddingBottom="3" overflowY="auto">
          {Array.from({ length: 20 }).map((_, i) => (
            <Stack key={`c-${i.toString()}`} gap="1">
              <Heading level={4} size="sm">
                v1.{20 - i}.0
              </Heading>
              <Text size="sm" color="fg.muted">
                Released 2026-0{((i % 9) + 1).toString()}-15.
              </Text>
              <Text size="sm">
                Fixed focus-trap on stacked dialogs, improved keyboard navigation in the menu bar,
                and tightened token naming across the overlay package.
              </Text>
            </Stack>
          ))}
        </Stack>
      </DrawerContent>
    </Drawer>
  ),
};

export const FormInside: Story = {
  name: 'Form inside drawer',
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Create issue</Button>
      </DrawerTrigger>
      <DrawerContent side="right" size="md">
        <DrawerHeader>
          <DrawerTitle>New issue</DrawerTitle>
          <DrawerDescription>
            Drafts are saved as you type — you can close and come back.
          </DrawerDescription>
        </DrawerHeader>
        <Stack
          as="form"
          gap="3"
          paddingX="5"
          paddingBottom="3"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Stack gap="1">
            <Text as="label" size="sm" weight="medium">
              Title
            </Text>
            <Input placeholder="Brief summary…" autoFocus />
          </Stack>
          <Stack gap="1">
            <Text as="label" size="sm" weight="medium">
              Description
            </Text>
            <Textarea rows={6} placeholder="What happened? What did you expect?" />
          </Stack>
        </Stack>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Discard</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button type="submit">Create</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const BottomSheetMobile: Story = {
  name: 'Bottom sheet pattern',
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Share</Button>
      </DrawerTrigger>
      <DrawerContent side="bottom" size="sm">
        <DrawerHeader>
          <DrawerTitle>Share this page</DrawerTitle>
          <DrawerDescription>Send the link to someone.</DrawerDescription>
        </DrawerHeader>
        <Inline gap="3" paddingX="5" paddingBottom="5">
          <Button variant="outline">Copy link</Button>
          <Button variant="outline">Email</Button>
          <Button variant="outline">Slack</Button>
        </Inline>
      </DrawerContent>
    </Drawer>
  ),
};
