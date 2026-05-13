import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs.js';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['line', 'solid', 'enclosed', 'soft'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    colorScheme: { control: 'select', options: ['accent', 'neutral'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    fullWidth: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

const IconHome = (): ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconUser = (): ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconBell = (): ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconLock = (): ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Text>Overview panel content.</Text>
      </TabsContent>
      <TabsContent value="activity">
        <Text>Activity panel content.</Text>
      </TabsContent>
      <TabsContent value="settings">
        <Text>Settings panel content.</Text>
      </TabsContent>
    </Tabs>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="6">
      {(['line', 'solid', 'enclosed', 'soft'] as const).map((variant) => (
        <Stack key={variant} gap="2">
          <Text size="sm" color="fg.muted">
            variant="{variant}"
          </Text>
          <Tabs defaultValue="one" variant={variant}>
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
              <TabsTrigger value="three">Three</TabsTrigger>
            </TabsList>
          </Tabs>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Stack key={size} gap="2">
          <Text size="sm" color="fg.muted">
            size="{size}"
          </Text>
          <Tabs defaultValue="a" size={size} variant="soft">
            <TabsList>
              <TabsTrigger value="a">Alpha</TabsTrigger>
              <TabsTrigger value="b">Beta</TabsTrigger>
              <TabsTrigger value="c">Gamma</TabsTrigger>
            </TabsList>
          </Tabs>
        </Stack>
      ))}
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="profile" variant="soft">
      <TabsList>
        <TabsTrigger value="profile">
          <IconUser />
          Profile
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <IconBell />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="security">
          <IconLock />
          Security
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Text>Manage how you appear to collaborators.</Text>
      </TabsContent>
      <TabsContent value="notifications">
        <Text>Choose which events email you.</Text>
      </TabsContent>
      <TabsContent value="security">
        <Text>Passwords, 2FA and session management.</Text>
      </TabsContent>
    </Tabs>
  ),
};

export const ManyTabs: Story = {
  name: 'Many tabs (horizontal overflow)',
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Tabs defaultValue="tab-1" variant="line">
        <TabsList style={{ overflowX: 'auto' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <TabsTrigger key={`tab-${i.toString()}`} value={`tab-${(i + 1).toString()}`}>
              Tab {i + 1}
            </TabsTrigger>
          ))}
        </TabsList>
        {Array.from({ length: 12 }).map((_, i) => (
          <TabsContent key={`tc-${i.toString()}`} value={`tab-${(i + 1).toString()}`}>
            <Text>Content for tab {i + 1}.</Text>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="draft" variant="soft">
      <TabsList>
        <TabsTrigger value="draft">Draft</TabsTrigger>
        <TabsTrigger value="review">In review</TabsTrigger>
        <TabsTrigger value="archived" disabled>
          Archived (locked)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="draft">
        <Text>Editable draft.</Text>
      </TabsContent>
      <TabsContent value="review">
        <Text>Awaiting reviewer sign-off.</Text>
      </TabsContent>
      <TabsContent value="archived">
        <Text>Archived records are read-only.</Text>
      </TabsContent>
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: () => {
    function ControlledTabs(): ReactElement {
      const [value, setValue] = useState('inbox');
      return (
        <Stack gap="3">
          <Inline gap="2">
            <Text size="sm" color="fg.muted">
              Active tab:
            </Text>
            <Text size="sm" weight="semibold">
              {value}
            </Text>
          </Inline>
          <Tabs value={value} onValueChange={setValue} variant="enclosed">
            <TabsList>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>
            <TabsContent value="inbox">
              <Text>12 unread threads.</Text>
            </TabsContent>
            <TabsContent value="sent">
              <Text>No outgoing messages today.</Text>
            </TabsContent>
            <TabsContent value="drafts">
              <Text>3 drafts saved locally.</Text>
            </TabsContent>
          </Tabs>
        </Stack>
      );
    }
    return <ControlledTabs />;
  },
};

export const VerticalOrientation: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" variant="soft">
      <TabsList style={{ minWidth: 160 }}>
        <TabsTrigger value="general">
          <IconHome />
          General
        </TabsTrigger>
        <TabsTrigger value="profile">
          <IconUser />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security">
          <IconLock />
          Security
        </TabsTrigger>
      </TabsList>
      <div style={{ flex: 1 }}>
        <TabsContent value="general">
          <Text>Workspace preferences apply to every project you belong to.</Text>
        </TabsContent>
        <TabsContent value="profile">
          <Text>Profile changes propagate instantly.</Text>
        </TabsContent>
        <TabsContent value="security">
          <Text>Rotate credentials and review recent sign-ins.</Text>
        </TabsContent>
      </div>
    </Tabs>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Tabs defaultValue="all" fullWidth variant="solid">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Text>148 issues total.</Text>
        </TabsContent>
        <TabsContent value="open">
          <Text>92 open issues.</Text>
        </TabsContent>
        <TabsContent value="closed">
          <Text>56 closed issues.</Text>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const SettingsUseCase: Story = {
  name: 'Use case — settings card',
  render: () => (
    <div
      style={{
        maxWidth: 720,
        border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
        borderRadius: 'var(--cynosure-radius-lg, 12px)',
        padding: 'var(--cynosure-space-6, 24px)',
        background: 'var(--cynosure-color-background-surface, #fff)',
      }}
    >
      <Tabs defaultValue="profile" variant="soft">
        <Stack gap="4">
          <Stack gap="1">
            <Heading level={3}>Account</Heading>
            <Text color="fg.muted">Manage how the workspace knows you.</Text>
          </Stack>
          <TabsList>
            <TabsTrigger value="profile">
              <IconUser />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <IconBell />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <IconLock />
              Security
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Stack gap="2">
              <Heading level={4} size="md">
                Profile
              </Heading>
              <Text color="fg.muted">
                Your name, avatar, and pronouns show up everywhere we mention you.
              </Text>
            </Stack>
          </TabsContent>
          <TabsContent value="notifications">
            <Stack gap="2">
              <Heading level={4} size="md">
                Notifications
              </Heading>
              <Text color="fg.muted">
                Pick which events email you and which only show up in-app.
              </Text>
            </Stack>
          </TabsContent>
          <TabsContent value="security">
            <Stack gap="2">
              <Heading level={4} size="md">
                Security
              </Heading>
              <Text color="fg.muted">
                Passwords, two-factor codes, and active sessions live here.
              </Text>
            </Stack>
          </TabsContent>
        </Stack>
      </Tabs>
    </div>
  ),
};

export const AllVariantsComparison: Story = {
  name: 'All variants — side by side',
  render: () => {
    function Demo(): ReactElement {
      const [value, setValue] = useState('analytics');
      return (
        <Stack gap="8">
          {(['line', 'solid', 'enclosed', 'soft'] as const).map((variant) => (
            <Stack key={variant} gap="3">
              <Text size="sm" weight="semibold" color="fg.muted">
                variant="{variant}"
              </Text>
              <Tabs value={value} onValueChange={setValue} variant={variant}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
              </Tabs>
            </Stack>
          ))}
          <Text size="sm" color="fg.muted">
            All four variants share the same active state — click around and watch the indicator
            slide.
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};
