import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useState } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Menu, MenuDivider, MenuGroup, MenuItem } from './Menu.js';

const meta: Meta<typeof Menu> = {
  title: 'Navigation/Menu',
  component: Menu,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Menu>;

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

const IconCalendar = (): ReactElement => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
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

export const SimpleList: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <Menu aria-label="Primary">
        <MenuItem>Dashboard</MenuItem>
        <MenuItem>Inbox</MenuItem>
        <MenuItem>Calendar</MenuItem>
        <MenuItem>Settings</MenuItem>
      </Menu>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <Menu aria-label="Primary">
        <MenuItem icon={<IconDashboard />}>Dashboard</MenuItem>
        <MenuItem icon={<IconInbox />} badge="12">
          Inbox
        </MenuItem>
        <MenuItem icon={<IconCalendar />}>Calendar</MenuItem>
        <MenuItem icon={<IconUsers />}>Team</MenuItem>
        <MenuItem icon={<IconGear />}>Settings</MenuItem>
      </Menu>
    </div>
  ),
};

export const WithGroupsAndDividers: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <Menu aria-label="Navigation">
        <MenuGroup label="Workspace">
          <MenuItem icon={<IconDashboard />}>Dashboard</MenuItem>
          <MenuItem icon={<IconInbox />} badge="3">
            Inbox
          </MenuItem>
          <MenuItem icon={<IconCalendar />}>Calendar</MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup label="Organisation">
          <MenuItem icon={<IconUsers />}>Members</MenuItem>
          <MenuItem icon={<IconGear />}>Settings</MenuItem>
        </MenuGroup>
      </Menu>
    </div>
  ),
};

export const NestedSections: Story = {
  name: 'Nested sections via indent',
  render: () => (
    <div style={{ width: 260 }}>
      <Menu aria-label="Docs">
        <MenuGroup label="Getting started">
          <MenuItem indent={1}>Installation</MenuItem>
          <MenuItem indent={1}>Quick start</MenuItem>
          <MenuItem indent={1} isActive>
            Theming
          </MenuItem>
        </MenuGroup>
        <MenuGroup label="Components" collapsible defaultOpen>
          <MenuItem indent={1}>Button</MenuItem>
          <MenuItem indent={1}>Input</MenuItem>
          <MenuItem indent={1}>Tabs</MenuItem>
          <MenuGroup label="Overlays" collapsible>
            <MenuItem indent={2}>Dialog</MenuItem>
            <MenuItem indent={2}>Popover</MenuItem>
            <MenuItem indent={2}>Tooltip</MenuItem>
          </MenuGroup>
        </MenuGroup>
        <MenuGroup label="Recipes" collapsible defaultOpen={false}>
          <MenuItem indent={1}>Login form</MenuItem>
          <MenuItem indent={1}>Command palette</MenuItem>
        </MenuGroup>
      </Menu>
    </div>
  ),
};

export const SelectedState: Story = {
  name: 'Active / selected state',
  render: () => {
    function Demo(): ReactElement {
      const [active, setActive] = useState('inbox');
      const items = [
        { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
        { id: 'inbox', label: 'Inbox', icon: <IconInbox />, badge: '12' },
        { id: 'calendar', label: 'Calendar', icon: <IconCalendar /> },
        { id: 'team', label: 'Team', icon: <IconUsers /> },
        { id: 'settings', label: 'Settings', icon: <IconGear /> },
      ];
      return (
        <Stack gap="3">
          <div style={{ width: 240 }}>
            <Menu aria-label="Navigation">
              {items.map((item) => (
                <MenuItem
                  key={item.id}
                  icon={item.icon}
                  badge={item.badge}
                  isActive={active === item.id}
                  onClick={() => setActive(item.id)}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </div>
          <Text size="sm" color="fg.muted">
            Active: <strong>{active}</strong>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const AsAnchor: Story = {
  name: 'As anchor via href',
  render: () => (
    <div style={{ width: 240 }}>
      <Menu aria-label="Docs links">
        <MenuItem icon={<IconDashboard />} href="#overview">
          Overview
        </MenuItem>
        <MenuItem icon={<IconInbox />} href="#getting-started" isActive>
          Getting started
        </MenuItem>
        <MenuItem icon={<IconGear />} href="#configuration">
          Configuration
        </MenuItem>
        <MenuItem icon={<IconUsers />} href="#contributing" disabled>
          Contributing (soon)
        </MenuItem>
      </Menu>
    </div>
  ),
};

export const AsChild: Story = {
  name: 'asChild — render a custom element',
  render: () => (
    <div style={{ width: 240 }}>
      <Menu aria-label="Router links">
        <MenuItem asChild icon={<IconDashboard />}>
          <a href="/dashboard">Dashboard (router)</a>
        </MenuItem>
        <MenuItem asChild icon={<IconInbox />} isActive>
          <a href="/inbox">Inbox (active)</a>
        </MenuItem>
        <MenuItem asChild icon={<IconGear />}>
          <a href="/settings">Settings</a>
        </MenuItem>
      </Menu>
    </div>
  ),
};

export const SettingsUseCase: Story = {
  name: 'Use case — settings sidebar',
  render: () => {
    function Demo(): ReactElement {
      const [active, setActive] = useState('profile');
      const section = (id: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        setActive(id);
      };
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, maxWidth: 720 }}>
          <Menu aria-label="Settings">
            <MenuGroup label="Account">
              <MenuItem isActive={active === 'profile'} onClick={section('profile')}>
                Profile
              </MenuItem>
              <MenuItem isActive={active === 'security'} onClick={section('security')}>
                Security
              </MenuItem>
              <MenuItem isActive={active === 'sessions'} onClick={section('sessions')}>
                Sessions
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup label="Workspace">
              <MenuItem isActive={active === 'members'} onClick={section('members')}>
                Members
              </MenuItem>
              <MenuItem isActive={active === 'billing'} onClick={section('billing')}>
                Billing
              </MenuItem>
              <MenuItem isActive={active === 'integrations'} onClick={section('integrations')}>
                Integrations
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup label="Advanced" collapsible defaultOpen={false}>
              <MenuItem isActive={active === 'api'} onClick={section('api')}>
                API keys
              </MenuItem>
              <MenuItem isActive={active === 'webhooks'} onClick={section('webhooks')}>
                Webhooks
              </MenuItem>
              <MenuItem disabled>Feature flags (soon)</MenuItem>
            </MenuGroup>
          </Menu>
          <Stack gap="3">
            <Text size="lg" weight="semibold">
              {active}
            </Text>
            <Text color="fg.muted">Pane content for "{active}".</Text>
          </Stack>
        </div>
      );
    }
    return <Demo />;
  },
};

export const LongLabels: Story = {
  name: 'Edge — long labels & disabled',
  render: () => (
    <div style={{ width: 240 }}>
      <Menu aria-label="Long labels">
        <MenuItem icon={<IconDashboard />}>A normal item</MenuItem>
        <MenuItem icon={<IconInbox />} badge="9999+">
          Something with an unusually long label that should truncate or wrap gracefully
        </MenuItem>
        <MenuItem icon={<IconGear />} disabled>
          Disabled item
        </MenuItem>
      </Menu>
    </div>
  ),
};
