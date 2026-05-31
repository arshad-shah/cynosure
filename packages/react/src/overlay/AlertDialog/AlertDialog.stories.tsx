import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
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

export const Interaction: Story = {
  name: 'Interaction · Escape is ignored, Cancel closes',
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
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Delete account' });
    await userEvent.click(trigger);
    // Content portals to document.body; AlertDialog uses role="alertdialog".
    const dialog = await within(document.body).findByRole('alertdialog');
    await expect(dialog).toBeInTheDocument();
    // Escape is suppressed — the dialog must stay open.
    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).queryByRole('alertdialog')).toBeInTheDocument();
    // Only Cancel / Action close it.
    await userEvent.click(within(document.body).getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(within(document.body).queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
  },
};
