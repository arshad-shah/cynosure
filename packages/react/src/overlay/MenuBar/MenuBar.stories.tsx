import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  MenuBar,
  MenuBarCheckboxItem,
  MenuBarContent,
  MenuBarItem,
  MenuBarLabel,
  MenuBarMenu,
  MenuBarRadioGroup,
  MenuBarRadioItem,
  MenuBarSeparator,
  MenuBarShortcut,
  MenuBarSub,
  MenuBarSubContent,
  MenuBarSubTrigger,
  MenuBarTrigger,
} from './MenuBar.js';

const meta: Meta<typeof MenuBar> = {
  title: 'Overlays/MenuBar',
  component: MenuBar,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof MenuBar>;

export const DesktopApp: Story = {
  name: 'Desktop app pattern',
  render: () => {
    function App(): React.ReactElement {
      const [wrap, setWrap] = useState(false);
      const [minimap, setMinimap] = useState(true);
      const [zoom, setZoom] = useState('100');
      return (
        <Stack gap="4">
          <MenuBar>
            <MenuBarMenu>
              <MenuBarTrigger>File</MenuBarTrigger>
              <MenuBarContent>
                <MenuBarItem
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 12h14M12 5v14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  description="Start a blank document"
                >
                  New file
                  <MenuBarShortcut>⌘N</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarItem>
                  New window
                  <MenuBarShortcut>⇧⌘N</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarSeparator />
                <MenuBarItem>
                  Open…
                  <MenuBarShortcut>⌘O</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarSub>
                  <MenuBarSubTrigger>Open recent</MenuBarSubTrigger>
                  <MenuBarSubContent>
                    <MenuBarItem>Q4 planning.md</MenuBarItem>
                    <MenuBarItem>cynosure-app/README.md</MenuBarItem>
                    <MenuBarItem>notes.md</MenuBarItem>
                    <MenuBarSeparator />
                    <MenuBarItem>Clear recent</MenuBarItem>
                  </MenuBarSubContent>
                </MenuBarSub>
                <MenuBarSeparator />
                <MenuBarItem>
                  Save
                  <MenuBarShortcut>⌘S</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarItem>
                  Save as…
                  <MenuBarShortcut>⇧⌘S</MenuBarShortcut>
                </MenuBarItem>
              </MenuBarContent>
            </MenuBarMenu>

            <MenuBarMenu>
              <MenuBarTrigger>Edit</MenuBarTrigger>
              <MenuBarContent>
                <MenuBarItem>
                  Undo
                  <MenuBarShortcut>⌘Z</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarItem>
                  Redo
                  <MenuBarShortcut>⇧⌘Z</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarSeparator />
                <MenuBarItem>
                  Cut
                  <MenuBarShortcut>⌘X</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarItem>
                  Copy
                  <MenuBarShortcut>⌘C</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarItem>
                  Paste
                  <MenuBarShortcut>⌘V</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarSeparator />
                <MenuBarItem>
                  Find…
                  <MenuBarShortcut>⌘F</MenuBarShortcut>
                </MenuBarItem>
              </MenuBarContent>
            </MenuBarMenu>

            <MenuBarMenu>
              <MenuBarTrigger>View</MenuBarTrigger>
              <MenuBarContent>
                <MenuBarLabel>Layout</MenuBarLabel>
                <MenuBarCheckboxItem checked={wrap} onCheckedChange={setWrap}>
                  Word wrap
                </MenuBarCheckboxItem>
                <MenuBarCheckboxItem checked={minimap} onCheckedChange={setMinimap}>
                  Show minimap
                </MenuBarCheckboxItem>
                <MenuBarSeparator />
                <MenuBarLabel>Zoom</MenuBarLabel>
                <MenuBarRadioGroup value={zoom} onValueChange={setZoom}>
                  <MenuBarRadioItem value="75">75%</MenuBarRadioItem>
                  <MenuBarRadioItem value="100">100%</MenuBarRadioItem>
                  <MenuBarRadioItem value="125">125%</MenuBarRadioItem>
                  <MenuBarRadioItem value="150">150%</MenuBarRadioItem>
                </MenuBarRadioGroup>
              </MenuBarContent>
            </MenuBarMenu>

            <MenuBarMenu>
              <MenuBarTrigger>Help</MenuBarTrigger>
              <MenuBarContent>
                <MenuBarItem>Documentation</MenuBarItem>
                <MenuBarItem>Keyboard shortcuts</MenuBarItem>
                <MenuBarSeparator />
                <MenuBarItem>About Cynosure</MenuBarItem>
              </MenuBarContent>
            </MenuBarMenu>
          </MenuBar>

          <Stack gap="1">
            <Text size="sm" color="fg.muted">
              word wrap: <strong>{String(wrap)}</strong> · minimap:{' '}
              <strong>{String(minimap)}</strong> · zoom: <strong>{zoom}%</strong>
            </Text>
          </Stack>
        </Stack>
      );
    }
    return <App />;
  },
};

export const SimpleMenus: Story = {
  render: () => (
    <MenuBar>
      <MenuBarMenu>
        <MenuBarTrigger>Account</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarItem>Profile</MenuBarItem>
          <MenuBarItem>Billing</MenuBarItem>
          <MenuBarSeparator />
          <MenuBarItem>Sign out</MenuBarItem>
        </MenuBarContent>
      </MenuBarMenu>
      <MenuBarMenu>
        <MenuBarTrigger>Workspace</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarItem>Settings</MenuBarItem>
          <MenuBarItem>Members</MenuBarItem>
          <MenuBarSeparator />
          <MenuBarItem>Switch workspace</MenuBarItem>
        </MenuBarContent>
      </MenuBarMenu>
    </MenuBar>
  ),
};

export const NestedSubmenus: Story = {
  render: () => (
    <MenuBar>
      <MenuBarMenu>
        <MenuBarTrigger>Format</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarSub>
            <MenuBarSubTrigger>Text</MenuBarSubTrigger>
            <MenuBarSubContent>
              <MenuBarItem>Bold</MenuBarItem>
              <MenuBarItem>Italic</MenuBarItem>
              <MenuBarSub>
                <MenuBarSubTrigger>Case</MenuBarSubTrigger>
                <MenuBarSubContent>
                  <MenuBarItem>UPPER</MenuBarItem>
                  <MenuBarItem>lower</MenuBarItem>
                  <MenuBarItem>Title</MenuBarItem>
                </MenuBarSubContent>
              </MenuBarSub>
            </MenuBarSubContent>
          </MenuBarSub>
          <MenuBarSub>
            <MenuBarSubTrigger>Paragraph</MenuBarSubTrigger>
            <MenuBarSubContent>
              <MenuBarItem>Align left</MenuBarItem>
              <MenuBarItem>Align center</MenuBarItem>
              <MenuBarItem>Align right</MenuBarItem>
            </MenuBarSubContent>
          </MenuBarSub>
        </MenuBarContent>
      </MenuBarMenu>
    </MenuBar>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · click opens a menu, arrow switches, Escape closes',
  render: () => (
    <MenuBar>
      <MenuBarMenu>
        <MenuBarTrigger>File</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarItem>New file</MenuBarItem>
          <MenuBarItem>Open…</MenuBarItem>
        </MenuBarContent>
      </MenuBarMenu>
      <MenuBarMenu>
        <MenuBarTrigger>Edit</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarItem>Undo</MenuBarItem>
          <MenuBarItem>Redo</MenuBarItem>
        </MenuBarContent>
      </MenuBarMenu>
    </MenuBar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileTrigger = canvas.getByRole('menuitem', { name: 'File' });
    await expect(fileTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(fileTrigger);
    await expect(fileTrigger).toHaveAttribute('aria-expanded', 'true');
    // The opened menu portals to document.body with its own items.
    const menu = await within(document.body).findByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: 'New file' })).toBeInTheDocument();
    // ArrowRight moves to the next top-level menu and opens it.
    await userEvent.keyboard('{ArrowRight}');
    const editTrigger = canvas.getByRole('menuitem', { name: 'Edit' });
    await waitFor(() => expect(editTrigger).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument());
  },
};
