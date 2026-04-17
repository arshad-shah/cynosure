import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Stack gap="3" align="start">
          <Text size="sm" color="fg.muted">
            open: <strong>{String(open)}</strong>
          </Text>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button>Controlled popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <Stack gap="3" padding="4" minWidth="240px">
                <Text size="sm">This popover&rsquo;s open state is external.</Text>
                <Inline gap="2" justify="end">
                  <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </Inline>
              </Stack>
            </PopoverContent>
          </Popover>
        </Stack>
      );
    }
    return <Controlled />;
  },
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

export const SharePopover: Story = {
  name: 'Use case — share link',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Share</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Stack gap="3" padding="4" minWidth="320px">
          <Stack gap="1">
            <Heading level={4} size="sm">
              Share this document
            </Heading>
            <Text size="xs" color="fg.muted">
              Anyone with the link can view.
            </Text>
          </Stack>
          <Inline gap="2">
            <Input readOnly defaultValue="https://lumen.app/d/abc" />
            <Button variant="outline">Copy</Button>
          </Inline>
          <Inline gap="2" justify="end">
            <PopoverClose asChild>
              <Button variant="ghost" size="sm">
                Done
              </Button>
            </PopoverClose>
          </Inline>
        </Stack>
      </PopoverContent>
    </Popover>
  ),
};

export const Nested: Story = {
  name: 'Nested popovers',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Open parent</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Stack gap="3" padding="4" minWidth="240px">
          <Text size="sm">Parent popover. Nested popovers are allowed.</Text>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                Open nested
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Stack gap="2" padding="3" minWidth="200px">
                <Text size="sm" weight="medium">
                  Nested popover
                </Text>
                <Text size="xs" color="fg.muted">
                  Esc closes this one first.
                </Text>
              </Stack>
            </PopoverContent>
          </Popover>
        </Stack>
      </PopoverContent>
    </Popover>
  ),
};
