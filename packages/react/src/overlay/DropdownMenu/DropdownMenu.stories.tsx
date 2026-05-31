import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTriggerButton,
} from './DropdownMenu.js';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Overlays/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof DropdownMenu>;

const IconEdit = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconCopy = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
const IconTrash = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTriggerButton variant="outline">Actions</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithIconsAndShortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTriggerButton>Document</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuLabel>Document</DropdownMenuLabel>
        <DropdownMenuItem icon={<IconEdit />}>
          Rename
          <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem icon={<IconCopy />}>
          Duplicate
          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<IconTrash />} variant="danger">
          Delete
          <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTriggerButton variant="outline">File</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuItem>New</DropdownMenuItem>
        <DropdownMenuItem>Open…</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Send to…</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Slack</DropdownMenuItem>
                <DropdownMenuItem>Linear</DropdownMenuItem>
                <DropdownMenuItem>Notion</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Quit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const CheckboxItems: Story = {
  render: () => {
    function Checkboxes(): React.ReactElement {
      const [showGrid, setShowGrid] = useState(true);
      const [showRulers, setShowRulers] = useState(false);
      const [showGuides, setShowGuides] = useState(true);
      return (
        <Stack gap="3">
          <DropdownMenu>
            <DropdownMenuTriggerButton variant="outline">View</DropdownMenuTriggerButton>
            <DropdownMenuContent>
              <DropdownMenuLabel>Canvas</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
                Show grid
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showRulers} onCheckedChange={setShowRulers}>
                Show rulers
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showGuides} onCheckedChange={setShowGuides}>
                Show guides
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Text size="sm" color="fg.muted">
            grid: {String(showGrid)} · rulers: {String(showRulers)} · guides: {String(showGuides)}
          </Text>
        </Stack>
      );
    }
    return <Checkboxes />;
  },
};

export const RadioItems: Story = {
  render: () => {
    function Radios(): React.ReactElement {
      const [theme, setTheme] = useState('system');
      return (
        <Stack gap="3">
          <DropdownMenu>
            <DropdownMenuTriggerButton variant="outline">Theme</DropdownMenuTriggerButton>
            <DropdownMenuContent>
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Text size="sm" color="fg.muted">
            Theme: <strong>{theme}</strong>
          </Text>
        </Stack>
      );
    }
    return <Radios />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · opens menu, Escape closes',
  render: () => (
    <DropdownMenu>
      <DropdownMenuTriggerButton variant="outline">Actions</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Actions/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    // Menu content portals to document.body.
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(
      within(document.body).getByRole('menuitem', { name: 'Profile' }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument());
  },
};
