import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Alert, AlertDescription, AlertTitle } from './Alert.js';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  argTypes: {
    status: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    variant: { control: 'select', options: ['solid', 'soft', 'outline', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    closable: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Alert>;

const STATUSES = ['info', 'success', 'warning', 'danger'] as const;
const VARIANTS = ['solid', 'soft', 'outline', 'ghost'] as const;

export const Playground: Story = {
  args: {
    status: 'info',
    variant: 'soft',
    size: 'md',
  },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>Tweak the controls to explore the surface.</AlertDescription>
    </Alert>
  ),
};

export const Statuses: Story = {
  name: 'Statuses — info / success / warning / danger',
  render: () => (
    <Stack gap="3" width="520px">
      {STATUSES.map((status) => (
        <Alert key={status} status={status}>
          <AlertTitle>{status[0]?.toUpperCase() + status.slice(1)}</AlertTitle>
          <AlertDescription>
            This is a {status} alert using the default soft variant.
          </AlertDescription>
        </Alert>
      ))}
    </Stack>
  ),
};

export const Variants: Story = {
  name: 'Variants — solid / soft / outline / ghost',
  render: () => (
    <Stack gap="3" width="520px">
      {VARIANTS.map((variant) => (
        <Alert key={variant} variant={variant} status="info">
          <AlertTitle>Variant: {variant}</AlertTitle>
          <AlertDescription>The same content rendered in every surface variant.</AlertDescription>
        </Alert>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="520px">
      <Alert size="sm" status="success">
        <AlertTitle>Small</AlertTitle>
        <AlertDescription>A compact alert for dense layouts.</AlertDescription>
      </Alert>
      <Alert size="md" status="success">
        <AlertTitle>Medium</AlertTitle>
        <AlertDescription>The default size, suitable for most contexts.</AlertDescription>
      </Alert>
      <Alert size="lg" status="success">
        <AlertTitle>Large</AlertTitle>
        <AlertDescription>A spacious alert for important announcements.</AlertDescription>
      </Alert>
    </Stack>
  ),
};

export const Closable: Story = {
  name: 'Closable — controlled via useState',
  render: () => {
    function Demo(): React.ReactElement {
      const [open, setOpen] = useState(true);
      return (
        <Stack gap="3" width="520px">
          {open ? (
            <Alert status="warning" closable onClose={() => setOpen(false)}>
              <AlertTitle>Your session expires in 5 minutes</AlertTitle>
              <AlertDescription>Save your work to avoid losing changes.</AlertDescription>
            </Alert>
          ) : (
            <Inline gap="2" align="center">
              <Text size="sm" color="fg.muted">
                Alert dismissed.
              </Text>
              <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                Restore
              </Button>
            </Inline>
          )}
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · status role + dismiss removes the alert',
  render: () => {
    function Demo(): React.ReactElement {
      const [open, setOpen] = useState(true);
      return open ? (
        <Alert status="success" closable onClose={() => setOpen(false)}>
          <AlertTitle>Changes saved</AlertTitle>
          <AlertDescription>Your profile was updated.</AlertDescription>
        </Alert>
      ) : (
        <Text size="sm" color="fg.muted">
          Dismissed.
        </Text>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Success alerts announce politely via role="status".
    const alert = canvas.getByRole('status');
    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-status', 'success');
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await expect(canvas.getByText('Dismissed.')).toBeInTheDocument();
  },
};
