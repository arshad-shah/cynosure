import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { Menu, MenuDivider, MenuGroup, MenuItem } from '../Menu/Menu.js';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from './Sidebar.js';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

const IconDashboard = (): ReactElement => (
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
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconInbox = (): ReactElement => (
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
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const IconUsers = (): ReactElement => (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconGear = (): ReactElement => (
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
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ShellLayout = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    style={{
      display: 'flex',
      minHeight: 420,
      border: '1px solid var(--lumen-color-border-subtle, #e5e7eb)',
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
        <Text color="fg.muted">The sidebar sits to the left; toggle it with the trigger.</Text>
      </Stack>
    )}
  </main>
);

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar>
          <SidebarBody>
            <Menu aria-label="Primary">
              <MenuItem icon={<IconDashboard />} isActive>
                Dashboard
              </MenuItem>
              <MenuItem icon={<IconInbox />} badge="3">
                Inbox
              </MenuItem>
              <MenuItem icon={<IconUsers />}>Team</MenuItem>
              <MenuItem icon={<IconGear />}>Settings</MenuItem>
            </Menu>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const DesktopCollapse: Story = {
  name: 'Desktop — toggle expanded / collapsed',
  render: () => {
    function Demo(): ReactElement {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
          <ShellLayout>
            <Sidebar>
              <SidebarHeader>
                <Inline gap="2" align="center" justify="between">
                  <Text weight="semibold">Acme</Text>
                  <SidebarTrigger />
                </Inline>
              </SidebarHeader>
              <SidebarBody>
                <Menu aria-label="Primary">
                  <MenuItem icon={<IconDashboard />} isActive>
                    Dashboard
                  </MenuItem>
                  <MenuItem icon={<IconInbox />}>Inbox</MenuItem>
                  <MenuItem icon={<IconUsers />}>Team</MenuItem>
                  <MenuItem icon={<IconGear />}>Settings</MenuItem>
                </Menu>
              </SidebarBody>
            </Sidebar>
            <DemoMain>
              <Stack gap="3">
                <Heading level={3}>Desktop layout</Heading>
                <Text color="fg.muted">
                  Collapsed: <strong>{collapsed ? 'yes' : 'no'}</strong>
                </Text>
                <Inline gap="2">
                  <button type="button" onClick={() => setCollapsed((c) => !c)}>
                    Toggle
                  </button>
                  <button type="button" onClick={() => setCollapsed(true)}>
                    Collapse
                  </button>
                  <button type="button" onClick={() => setCollapsed(false)}>
                    Expand
                  </button>
                </Inline>
              </Stack>
            </DemoMain>
          </ShellLayout>
        </SidebarProvider>
      );
    }
    return <Demo />;
  },
};

export const MobileDrawer: Story = {
  name: 'Mobile drawer (forced via mobileQuery)',
  render: () => (
    <SidebarProvider mobileQuery="(min-width: 0px)">
      <div
        style={{
          minHeight: 360,
          padding: 24,
          border: '1px solid var(--lumen-color-border-subtle, #e5e7eb)',
          borderRadius: 12,
        }}
      >
        <Inline align="center" justify="between" gap="3">
          <SidebarTrigger />
          <Text weight="semibold">Acme — Mobile</Text>
          <span />
        </Inline>
        <Sidebar mobileTitle="Main menu">
          <SidebarHeader>
            <Text weight="semibold">Menu</Text>
          </SidebarHeader>
          <SidebarBody>
            <Menu aria-label="Primary">
              <MenuItem icon={<IconDashboard />}>Dashboard</MenuItem>
              <MenuItem icon={<IconInbox />}>Inbox</MenuItem>
              <MenuItem icon={<IconUsers />}>Team</MenuItem>
              <MenuItem icon={<IconGear />}>Settings</MenuItem>
            </Menu>
          </SidebarBody>
        </Sidebar>
        <Stack gap="2" marginTop="6">
          <Text color="fg.muted">
            This story forces mobile via <code>mobileQuery="(min-width: 0px)"</code>. Tap the
            hamburger to open the drawer.
          </Text>
        </Stack>
      </div>
    </SidebarProvider>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar>
          <SidebarHeader>
            <Inline gap="2" align="center" justify="between">
              <Text weight="semibold">Acme</Text>
              <SidebarTrigger />
            </Inline>
          </SidebarHeader>
          <SidebarBody>
            <Menu aria-label="Primary">
              <MenuGroup label="Workspace">
                <MenuItem icon={<IconDashboard />} isActive>
                  Dashboard
                </MenuItem>
                <MenuItem icon={<IconInbox />} badge="12">
                  Inbox
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup label="Admin" collapsible>
                <MenuItem icon={<IconUsers />}>Members</MenuItem>
                <MenuItem icon={<IconGear />}>Settings</MenuItem>
              </MenuGroup>
            </Menu>
          </SidebarBody>
          <SidebarFooter>
            <Inline gap="2" align="center">
              <div
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--lumen-color-accent-9, #4f46e5)',
                }}
              />
              <Stack gap="0">
                <Text size="sm" weight="semibold">
                  Ada Lovelace
                </Text>
                <Text size="xs" color="fg.muted">
                  ada@example.com
                </Text>
              </Stack>
            </Inline>
          </SidebarFooter>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const RightSide: Story = {
  render: () => (
    <SidebarProvider side="right">
      <ShellLayout>
        <DemoMain>
          <Stack gap="3">
            <Heading level={3}>Inspector</Heading>
            <Text color="fg.muted">Right-anchored sidebar (e.g. details panel).</Text>
          </Stack>
        </DemoMain>
        <Sidebar>
          <SidebarHeader>
            <Inline gap="2" align="center" justify="between">
              <Text weight="semibold">Details</Text>
              <SidebarTrigger />
            </Inline>
          </SidebarHeader>
          <SidebarBody>
            <Stack gap="3">
              <Text size="sm" color="fg.muted">
                Metadata, tags, linked items.
              </Text>
              <Text size="sm">status: open</Text>
              <Text size="sm">assignee: ada</Text>
              <Text size="sm">priority: high</Text>
            </Stack>
          </SidebarBody>
        </Sidebar>
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const DocsUseCase: Story = {
  name: 'Use case — docs shell',
  render: () => {
    function Demo(): ReactElement {
      const [active, setActive] = useState('theming');
      return (
        <SidebarProvider>
          <ShellLayout>
            <Sidebar>
              <SidebarHeader>
                <Text weight="semibold">Lumen docs</Text>
              </SidebarHeader>
              <SidebarBody>
                <Menu aria-label="Docs">
                  <MenuGroup label="Getting started">
                    <MenuItem isActive={active === 'install'} onClick={() => setActive('install')}>
                      Installation
                    </MenuItem>
                    <MenuItem isActive={active === 'quick'} onClick={() => setActive('quick')}>
                      Quick start
                    </MenuItem>
                    <MenuItem isActive={active === 'theming'} onClick={() => setActive('theming')}>
                      Theming
                    </MenuItem>
                  </MenuGroup>
                  <MenuGroup label="Components" collapsible defaultOpen>
                    <MenuItem isActive={active === 'button'} onClick={() => setActive('button')}>
                      Button
                    </MenuItem>
                    <MenuItem isActive={active === 'input'} onClick={() => setActive('input')}>
                      Input
                    </MenuItem>
                    <MenuItem isActive={active === 'tabs'} onClick={() => setActive('tabs')}>
                      Tabs
                    </MenuItem>
                  </MenuGroup>
                </Menu>
              </SidebarBody>
            </Sidebar>
            <DemoMain>
              <Stack gap="3">
                <Heading level={3}>{active}</Heading>
                <Text color="fg.muted">Docs content for the "{active}" section goes here.</Text>
              </Stack>
            </DemoMain>
          </ShellLayout>
        </SidebarProvider>
      );
    }
    return <Demo />;
  },
};
