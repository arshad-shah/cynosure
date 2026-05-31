import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Notification } from './Notification.js';

const meta: Meta<typeof Notification> = {
  title: 'Feedback/Notification',
  component: Notification,
  parameters: { layout: 'padded' },
  argTypes: {
    unread: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Notification>;

const IconBell = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

const IconComment = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  </svg>
);

const IconCheck = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Playground: Story = {
  args: {
    title: 'New comment on your PR',
    description: 'Grace Hopper left 2 comments on "feat: polish Alert component".',
    timestamp: '2m ago',
    unread: true,
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <Notification {...args} icon={<IconComment />} />
    </div>
  ),
};

export const UnreadVsRead: Story = {
  name: 'Unread vs read',
  render: () => (
    <Stack gap="3" width="420px">
      <Notification
        unread
        icon={<IconBell />}
        title="You have a new mention"
        description="Alan Turing mentioned you in #engineering."
        timestamp="just now"
      />
      <Notification
        icon={<IconCheck />}
        title="Deployment succeeded"
        description="Your build of main was deployed to production."
        timestamp="3h ago"
      />
    </Stack>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Notification
        unread
        icon={<IconComment />}
        title="Ada requested your review"
        description='"feat(feedback): add Toggle and ToggleGroup components"'
        timestamp="5m ago"
        actions={
          <Inline gap="2">
            <Button size="sm">Review</Button>
            <Button size="sm" variant="ghost">
              Snooze
            </Button>
          </Inline>
        }
      />
    </div>
  ),
};

export const Dismissable: Story = {
  name: 'Dismissable — onDismiss removes from list',
  render: () => {
    type Item = {
      id: string;
      title: string;
      description: string;
      timestamp: string;
      unread: boolean;
    };
    function Demo(): React.ReactElement {
      const [items, setItems] = useState<Item[]>([
        {
          id: '1',
          title: 'Deployment succeeded',
          description: 'main → production, 3s cold start.',
          timestamp: '1m ago',
          unread: true,
        },
        {
          id: '2',
          title: 'New mention in #general',
          description: 'Ada Lovelace mentioned you.',
          timestamp: '4m ago',
          unread: true,
        },
        {
          id: '3',
          title: 'Build passed',
          description: '142/142 tests green.',
          timestamp: '1h ago',
          unread: false,
        },
      ]);
      return (
        <Stack gap="2" width="420px">
          {items.map((item) => (
            <Notification
              key={item.id}
              unread={item.unread}
              icon={<IconBell />}
              title={item.title}
              description={item.description}
              timestamp={item.timestamp}
              onRead={() =>
                setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, unread: false } : x)))
              }
              onDismiss={() => setItems((xs) => xs.filter((x) => x.id !== item.id))}
            />
          ))}
          {items.length === 0 ? (
            <Text size="sm" color="fg.muted">
              Inbox zero. Nice.
            </Text>
          ) : null}
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · dismiss removes the notification',
  render: () => {
    function Demo(): React.ReactElement {
      const [open, setOpen] = useState(true);
      return (
        <div style={{ width: 420 }}>
          {open ? (
            <Notification
              icon={<IconBell />}
              title="Deployment succeeded"
              description="main → production."
              timestamp="1m ago"
              onDismiss={() => setOpen(false)}
            />
          ) : (
            <Text size="sm" color="fg.muted">
              Dismissed.
            </Text>
          )}
        </div>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Deployment succeeded')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss notification' }));
    await expect(canvas.queryByText('Deployment succeeded')).not.toBeInTheDocument();
    await expect(canvas.getByText('Dismissed.')).toBeInTheDocument();
  },
};
