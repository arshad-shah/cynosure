// packages/react/src/navigation/Sidebar/Sidebar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CogIcon, InboxIcon, LayoutDashboardIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
  SidebarSeparator,
  SidebarSubItem,
  SidebarSubNav,
  SidebarTrigger,
} from './index.js';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

const ShellLayout = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    style={{
      display: 'flex',
      minHeight: 420,
      border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
      borderRadius: 12,
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

const DemoMain = ({ children }: { children?: ReactNode }): ReactElement => (
  <main style={{ flex: 1, padding: 24 }}>
    {children ?? (
      <Stack gap="3">
        <Heading level={3}>Main content</Heading>
        <Text color="fg.muted">Toggle the sidebar with the trigger.</Text>
      </Stack>
    )}
  </main>
);

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarHeader>
            <Inline gap="2" align="center" justify="between">
              <Text weight="semibold">Acme</Text>
              <SidebarTrigger />
            </Inline>
          </SidebarHeader>
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" isActive />
              <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" badge="3" />
              <SidebarItem icon={<UsersIcon size={18} />} label="Team" />
              <SidebarItem icon={<CogIcon size={18} />} label="Settings" />
            </SidebarNav>
          </SidebarBody>
          <SidebarFooter>
            <Text size="xs" color="fg.muted">
              v1.0
            </Text>
          </SidebarFooter>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const CollapsibleRail: Story = {
  render: () => {
    function Demo(): ReactElement {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
          <ShellLayout>
            <Sidebar aria-label="Primary">
              <SidebarHeader>
                <Inline gap="2" align="center" justify="between">
                  <Text weight="semibold">Acme</Text>
                  <SidebarTrigger />
                </Inline>
              </SidebarHeader>
              <SidebarBody>
                <SidebarNav aria-label="Primary">
                  <SidebarItem
                    icon={<LayoutDashboardIcon size={18} />}
                    label="Dashboard"
                    isActive
                  />
                  <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" badge="3" />
                  <SidebarItem icon={<UsersIcon size={18} />} label="Team" />
                </SidebarNav>
              </SidebarBody>
            </Sidebar>
            <DemoMain>
              <Text>Collapsed: {collapsed ? 'yes' : 'no'}</Text>
            </DemoMain>
          </ShellLayout>
        </SidebarProvider>
      );
    }
    return <Demo />;
  },
};

export const NestedNav: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" />
              <SidebarSubNav
                parentLabel="Settings"
                defaultOpen
                trigger={<SidebarItem icon={<CogIcon size={18} />} label="Settings" />}
              >
                <SidebarSubItem isActive>Billing</SidebarSubItem>
                <SidebarSubItem>Team</SidebarSubItem>
                <SidebarSubItem>API</SidebarSubItem>
              </SidebarSubNav>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarGroup label="Workspace">
                <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" isActive />
                <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" badge="12" />
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup
                label="Projects"
                action={
                  <button
                    type="button"
                    aria-label="New project"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <PlusIcon size={14} />
                  </button>
                }
              >
                <SidebarItem label="Website" />
                <SidebarItem label="Mobile app" />
              </SidebarGroup>
              <SidebarGroup label="Admin" collapsible>
                <SidebarItem icon={<UsersIcon size={18} />} label="Members" />
                <SidebarItem icon={<CogIcon size={18} />} label="Settings" />
              </SidebarGroup>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const AsChildLinks: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem asChild icon={<LayoutDashboardIcon size={18} />} label="Dashboard">
                <a href="/dashboard">Dashboard</a>
              </SidebarItem>
              <SidebarItem asChild icon={<InboxIcon size={18} />} label="Inbox">
                <a href="/inbox">Inbox</a>
              </SidebarItem>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const MobileDrawer: Story = {
  render: () => (
    <SidebarProvider mobileQuery="(min-width: 0px)">
      <div
        style={{
          minHeight: 360,
          padding: 24,
          border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
          borderRadius: 12,
        }}
      >
        <Inline align="center" justify="between" gap="3">
          <SidebarTrigger />
          <Text weight="semibold">Acme — Mobile</Text>
          <span />
        </Inline>
        <Sidebar aria-label="Primary" mobileTitle="Main menu">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" />
              <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </div>
    </SidebarProvider>
  ),
};

export const RightSide: Story = {
  render: () => (
    <SidebarProvider side="right">
      <ShellLayout>
        <DemoMain />
        <Sidebar aria-label="Inspector">
          <SidebarHeader>
            <Inline gap="2" align="center" justify="between">
              <Text weight="semibold">Inspector</Text>
              <SidebarTrigger />
            </Inline>
          </SidebarHeader>
          <SidebarBody>
            <Text size="sm" color="fg.muted">
              Metadata, tags, linked items.
            </Text>
          </SidebarBody>
        </Sidebar>
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const FloatingVariant: Story = {
  render: () => (
    <SidebarProvider variant="floating">
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" isActive />
              <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const InsetVariant: Story = {
  render: () => (
    <SidebarProvider variant="inset">
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" isActive />
              <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const DocsShell: Story = {
  render: () => {
    function Demo(): ReactElement {
      const [active, setActive] = useState('theming');
      return (
        <SidebarProvider>
          <ShellLayout>
            <Sidebar aria-label="Docs">
              <SidebarHeader>
                <Text weight="semibold">Cynosure docs</Text>
              </SidebarHeader>
              <SidebarBody>
                <SidebarNav aria-label="Docs">
                  <SidebarGroup label="Getting started">
                    <SidebarItem
                      label="Installation"
                      isActive={active === 'install'}
                      onClick={() => setActive('install')}
                    />
                    <SidebarItem
                      label="Theming"
                      isActive={active === 'theming'}
                      onClick={() => setActive('theming')}
                    />
                  </SidebarGroup>
                  <SidebarGroup label="Components" collapsible defaultOpen>
                    <SidebarItem
                      label="Button"
                      isActive={active === 'button'}
                      onClick={() => setActive('button')}
                    />
                    <SidebarItem
                      label="Input"
                      isActive={active === 'input'}
                      onClick={() => setActive('input')}
                    />
                  </SidebarGroup>
                </SidebarNav>
              </SidebarBody>
            </Sidebar>
            <DemoMain>
              <Heading level={3}>{active}</Heading>
            </DemoMain>
          </ShellLayout>
        </SidebarProvider>
      );
    }
    return <Demo />;
  },
};
