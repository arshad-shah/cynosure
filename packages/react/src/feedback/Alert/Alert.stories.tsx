import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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

const SparkleIcon = (): React.ReactElement => (
  <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2Z" />
  </svg>
);

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

export const Matrix: Story = {
  name: 'Full matrix — statuses x variants',
  render: () => (
    <Stack gap="4" width="640px">
      {VARIANTS.map((variant) => (
        <Stack key={variant} gap="2">
          <Text size="sm" color="fg.muted" weight="medium">
            {variant}
          </Text>
          {STATUSES.map((status) => (
            <Alert key={status} variant={variant} status={status}>
              <AlertTitle>{status}</AlertTitle>
              <AlertDescription>
                A {variant} {status} alert with title and description.
              </AlertDescription>
            </Alert>
          ))}
        </Stack>
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

export const CustomIcon: Story = {
  name: 'Icon customization — custom icon or none',
  render: () => (
    <Stack gap="3" width="520px">
      <Alert status="info" icon={<SparkleIcon />}>
        <AlertTitle>Custom icon</AlertTitle>
        <AlertDescription>
          Pass any <code>ReactNode</code> via the <code>icon</code> prop.
        </AlertDescription>
      </Alert>
      <Alert status="success" icon={false}>
        <AlertTitle>No icon</AlertTitle>
        <AlertDescription>
          Pass <code>icon={'{false}'}</code> to hide the default status icon.
        </AlertDescription>
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

export const SuccessToast: Story = {
  name: 'Realistic — success toast pattern',
  render: () => (
    <Alert status="success" variant="soft" style={{ width: 420 }}>
      <AlertTitle>Changes saved</AlertTitle>
      <AlertDescription>
        Your profile was updated just now. Refresh to see the latest.
      </AlertDescription>
    </Alert>
  ),
};

export const TitleOnly: Story = {
  name: 'Edge case — title only, no description',
  render: () => (
    <Stack gap="3" width="520px">
      <Alert status="info">
        <AlertTitle>No description here — just a terse heads-up.</AlertTitle>
      </Alert>
      <Alert status="danger" closable>
        <AlertTitle>Action required</AlertTitle>
      </Alert>
    </Stack>
  ),
};

export const LongContent: Story = {
  name: 'Edge case — long description wraps',
  render: () => (
    <Alert status="info" style={{ width: 520 }}>
      <AlertTitle>About this release</AlertTitle>
      <AlertDescription>
        This release introduces a brand-new Feedback module with Alert, Banner, Notification,
        Callout, EmptyState, Toggle, ToggleGroup, Avatar, AvatarGroup, Badge, Tag, and Chip
        components — all themable via vanilla-extract tokens and accessible by default.
      </AlertDescription>
    </Alert>
  ),
};
