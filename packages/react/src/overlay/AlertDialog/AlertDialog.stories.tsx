import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Input } from '../../forms/Input/Input.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog.js';

const meta: Meta<typeof AlertDialog> = {
  title: 'Overlays/AlertDialog',
  component: AlertDialog,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const DeleteConfirmation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="soft" colorScheme="danger">
          Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your account and remove all associated data. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button colorScheme="danger">Yes, delete account</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const SessionTimeout: Story = {
  name: 'Session timeout warning',
  render: () => (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show session warning</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your session is about to expire</AlertDialogTitle>
          <AlertDialogDescription>
            For your security, you will be signed out in 1 minute. Would you like to stay signed in?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Sign out</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button>Stay signed in</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const IrreversibleWarning: Story = {
  name: 'Irreversible action',
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="soft" colorScheme="warning">
          Revoke API key
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="md">
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke &ldquo;prod-key-2025&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            Any application using this key will immediately lose access. There is no way to restore
            a revoked key — you will need to issue a new one.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Keep it</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button colorScheme="danger">Revoke key</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const AsyncAction: Story = {
  name: 'Async confirmation (loading)',
  render: () => {
    function Async(): React.ReactElement {
      const [open, setOpen] = useState(false);
      const [loading, setLoading] = useState(false);

      async function confirm(): Promise<void> {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1600));
        setLoading(false);
        setOpen(false);
      }

      return (
        <Stack gap="3">
          <Button variant="soft" colorScheme="danger" onClick={() => setOpen(true)}>
            Archive workspace
          </Button>
          <AlertDialog open={open} onOpenChange={(next) => (loading ? null : setOpen(next))}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive workspace?</AlertDialogTitle>
                <AlertDialogDescription>
                  The workspace will be archived and made read-only. This can take a moment.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="ghost" disabled={loading}>
                    Cancel
                  </Button>
                </AlertDialogCancel>
                {/* Not AlertDialogAction — we don't want it to auto-close while loading. */}
                <Button colorScheme="danger" loading={loading} onClick={confirm}>
                  Archive
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Stack>
      );
    }
    return <Async />;
  },
};

export const TypeToConfirm: Story = {
  name: 'Type-to-confirm',
  render: () => {
    function Type(): React.ReactElement {
      const required = 'DELETE';
      const [value, setValue] = useState('');
      const matches = value.trim() === required;
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="soft" colorScheme="danger">
              Delete database
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete production database?</AlertDialogTitle>
              <AlertDialogDescription>
                Type <strong>{required}</strong> below to confirm. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Stack gap="2" paddingX="5" paddingBottom="3">
              <Input placeholder={`Type ${required}`} value={value} onChange={setValue} autoFocus />
              <Text size="xs" color="fg.muted">
                {matches ? 'Confirmation matches.' : 'Confirmation does not match.'}
              </Text>
            </Stack>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="ghost">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button colorScheme="danger" disabled={!matches}>
                  Delete database
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
    return <Type />;
  },
};

export const CannotDismissByOverlay: Story = {
  name: 'Cannot dismiss (overlay / Esc)',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        AlertDialog suppresses Escape and overlay clicks — the user must choose Cancel or Action.
      </Text>
      <Inline gap="3" align="center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Attempt a dismiss</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm required</AlertDialogTitle>
              <AlertDialogDescription>
                Try pressing Esc or clicking the dim backdrop — nothing happens.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="ghost">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button>Continue</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Inline>
    </Stack>
  ),
};
