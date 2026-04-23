// packages/react/src/feedback/Indicator/Indicator.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BellIcon, InboxIcon, UserIcon } from 'lucide-react';
import { type ReactElement, useState } from 'react';
import {
  Sidebar,
  SidebarBody,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
} from '../../navigation/Sidebar/index.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Avatar } from '../Avatar/Avatar.js';
import { Indicator } from './index.js';

const meta: Meta<typeof Indicator> = {
  title: 'Feedback/Indicator',
  component: Indicator,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof Indicator>;

const Square = ({ label = 'child' }: { label?: string }): ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 8,
      background: 'var(--cynosure-color-background-canvas, #f3f4f6)',
      border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
      fontSize: 12,
    }}
  >
    {label}
  </span>
);

export const Default: Story = {
  render: () => (
    <Indicator content="3" colorScheme="danger">
      <button
        type="button"
        aria-label="Notifications"
        style={{
          padding: 8,
          borderRadius: 8,
          border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <BellIcon size={18} />
      </button>
    </Indicator>
  ),
};

export const Dot: Story = {
  render: () => (
    <Indicator dot colorScheme="success" aria-label="Online">
      <Avatar size="md" fallback={<UserIcon size={18} />} />
    </Indicator>
  ),
};

export const Placements: Story = {
  render: () => (
    <Inline gap="6" align="center">
      <Stack gap="2" align="center">
        <Indicator content="1" placement="top-start">
          <Square label="t-s" />
        </Indicator>
        <Text size="xs" color="fg.muted">
          top-start
        </Text>
      </Stack>
      <Stack gap="2" align="center">
        <Indicator content="1" placement="top-end">
          <Square label="t-e" />
        </Indicator>
        <Text size="xs" color="fg.muted">
          top-end
        </Text>
      </Stack>
      <Stack gap="2" align="center">
        <Indicator content="1" placement="bottom-start">
          <Square label="b-s" />
        </Indicator>
        <Text size="xs" color="fg.muted">
          bottom-start
        </Text>
      </Stack>
      <Stack gap="2" align="center">
        <Indicator content="1" placement="bottom-end">
          <Square label="b-e" />
        </Indicator>
        <Text size="xs" color="fg.muted">
          bottom-end
        </Text>
      </Stack>
    </Inline>
  ),
};

export const Offset: Story = {
  render: () => (
    <Inline gap="6" align="center">
      {[-4, 0, 4, 8].map((o) => (
        <Stack key={o} gap="2" align="center">
          <Indicator content="1" offset={o}>
            <Square />
          </Indicator>
          <Text size="xs" color="fg.muted">
            offset={o}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};

export const ColorSchemes: Story = {
  render: () => (
    <Inline gap="4" align="center">
      {(['neutral', 'info', 'success', 'warning', 'danger'] as const).map((cs) => (
        <Stack key={cs} gap="2" align="center">
          <Indicator content="!" colorScheme={cs}>
            <Square />
          </Indicator>
          <Text size="xs" color="fg.muted">
            {cs}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};

export const MaxCount: Story = {
  render: () => {
    const count = 142;
    return (
      <Indicator content={count > 99 ? '99+' : count} colorScheme="danger">
        <button
          type="button"
          aria-label="Inbox"
          style={{
            padding: 8,
            borderRadius: 8,
            border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
            background: 'transparent',
          }}
        >
          <InboxIcon size={18} />
        </button>
      </Indicator>
    );
  },
};

export const InvisibleToggle: Story = {
  render: () => {
    function Demo(): ReactElement {
      const [count, setCount] = useState(3);
      return (
        <Stack gap="3" align="center">
          <Indicator content={count} hideOn={(v) => v === 0} colorScheme="danger">
            <button
              type="button"
              aria-label="Notifications"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
                background: 'transparent',
              }}
            >
              <BellIcon size={18} />
            </button>
          </Indicator>
          <Inline gap="2">
            <button type="button" onClick={() => setCount((c) => Math.max(0, c - 1))}>
              -
            </button>
            <Text>{count}</Text>
            <button type="button" onClick={() => setCount((c) => c + 1)}>
              +
            </button>
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const OnSidebarItem: Story = {
  render: () => (
    <SidebarProvider>
      <div
        style={{
          display: 'flex',
          width: 280,
          minHeight: 200,
          border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <Indicator dot colorScheme="danger" aria-label="New messages">
                <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" />
              </Indicator>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </div>
    </SidebarProvider>
  ),
};
