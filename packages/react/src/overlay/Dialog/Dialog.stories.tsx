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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog.js';

const meta: Meta<typeof Dialog> = {
  title: 'Overlays/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite teammates</DialogTitle>
          <DialogDescription>
            Share a link to invite new members to the workspace.
          </DialogDescription>
        </DialogHeader>
        <Stack gap="3" paddingX="5" paddingBottom="3">
          <Input placeholder="name@company.com" />
        </Stack>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Send invite</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Stack gap="3">
          <Inline gap="3" align="center">
            <Button onClick={() => setOpen(true)}>Open via state</Button>
            <Text size="sm" color="fg.muted">
              open: <strong>{String(open)}</strong>
            </Text>
          </Inline>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Controlled dialog</DialogTitle>
                <DialogDescription>
                  State lives outside the component. Closing the dialog syncs the parent state via{' '}
                  <code>onOpenChange</code>.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Dismiss
                </Button>
                <Button onClick={() => setOpen(false)}>Got it</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="3" wrap>
      {(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button variant="outline">size={size}</Button>
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>Size: {size}</DialogTitle>
              <DialogDescription>
                The <code>size</code> prop controls the max width of the content surface.{' '}
                <code>full</code> fills the viewport.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </Inline>
  ),
};

export const LongContentScroll: Story = {
  name: 'Long body — scrolls inside content',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Read terms</Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Effective 2026-01-01</DialogDescription>
        </DialogHeader>
        <Stack
          gap="3"
          paddingX="5"
          paddingBottom="3"
          style={{ maxHeight: '60vh', overflowY: 'auto' }}
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <Text key={`p-${i.toString()}`} size="sm">
              Section {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Text>
          ))}
        </Stack>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DestructiveConfirm: Story = {
  name: 'Destructive confirmation',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="soft" colorScheme="danger">
          Delete project
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete &ldquo;lumen-app&rdquo;?</DialogTitle>
          <DialogDescription>
            This permanently removes the project and all of its data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button colorScheme="danger">Delete project</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FocusReturn: Story = {
  name: 'Escape + focus return',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        Press Esc or click the close button — focus returns to the trigger.
      </Text>
      <Inline gap="3">
        <Button variant="outline">Sibling A</Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open me, focus returns here</Button>
          </DialogTrigger>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Focus demo</DialogTitle>
              <DialogDescription>
                When you press <kbd>Esc</kbd> this dialog closes and focus moves back to the button
                that opened it.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Dismiss</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="outline">Sibling B</Button>
      </Inline>
    </Stack>
  ),
};

export const ShareUseCase: Story = {
  name: 'Use case — share document',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Share document</Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Share &ldquo;Q4 planning&rdquo;</DialogTitle>
          <DialogDescription>Anyone with this link can view the document.</DialogDescription>
        </DialogHeader>
        <Stack gap="4" paddingX="5" paddingBottom="3">
          <Inline gap="2">
            <Input readOnly defaultValue="https://lumen.app/d/q4-planning" />
            <Button variant="outline">Copy link</Button>
          </Inline>
          <Stack gap="2">
            <Heading level={4} size="sm">
              Invite people
            </Heading>
            <Input placeholder="Add people by email" />
            <Textarea placeholder="Optional message" rows={3} />
          </Stack>
        </Stack>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Send invites</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Nested: Story = {
  name: 'Nested dialog',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open parent</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Parent dialog</DialogTitle>
          <DialogDescription>
            Dialogs can stack — the child creates its own focus trap.
          </DialogDescription>
        </DialogHeader>
        <Stack gap="3" paddingX="5" paddingBottom="3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open nested dialog</Button>
            </DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Nested dialog</DialogTitle>
                <DialogDescription>Esc closes me first; the parent stays open.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>OK</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Stack>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close parent</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
