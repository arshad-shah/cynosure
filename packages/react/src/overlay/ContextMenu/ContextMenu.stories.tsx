import type { Meta, StoryObj } from '@storybook/react';
import { forwardRef, useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './ContextMenu.js';

const meta: Meta<typeof ContextMenu> = {
  title: 'Overlays/ContextMenu',
  component: ContextMenu,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ContextMenu>;

const Target = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Target(
  { children, ...rest },
  ref,
) {
  return (
    <Stack
      ref={ref}
      padding="6"
      minHeight="120px"
      minWidth="360px"
      borderRadius="md"
      borderWidth="1"
      borderStyle="dashed"
      borderColor="border.default"
      background="bg.subtle"
      align="center"
      justify="center"
      {...rest}
    >
      <Text size="sm" color="fg.muted">
        {children ?? 'Right-click anywhere in this box'}
      </Text>
    </Stack>
  );
});

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Target />
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>Reload</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>View source</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Target>Right-click for file options</Target>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>File</ContextMenuLabel>
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Open with</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Text editor</ContextMenuItem>
            <ContextMenuItem>Preview</ContextMenuItem>
            <ContextMenuItem>System default</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger">
          Move to trash
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

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

export const WithIconsAndVariants: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Target>Right-click for file actions</Target>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem icon={<IconEdit />} description="Change the file name">
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          icon={<IconTrash />}
          variant="danger"
          description="This action cannot be undone"
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const CheckboxItems: Story = {
  render: () => {
    function Demo(): React.ReactElement {
      const [bold, setBold] = useState(true);
      const [italic, setItalic] = useState(false);
      const [strike, setStrike] = useState(false);
      return (
        <Stack gap="3">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <Target>Right-click to toggle format</Target>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>Format</ContextMenuLabel>
              <ContextMenuCheckboxItem checked={bold} onCheckedChange={setBold}>
                Bold
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem checked={italic} onCheckedChange={setItalic}>
                Italic
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem checked={strike} onCheckedChange={setStrike}>
                Strikethrough
              </ContextMenuCheckboxItem>
            </ContextMenuContent>
          </ContextMenu>
          <Inline gap="3">
            <Text size="sm" color="fg.muted">
              Bold: <strong>{String(bold)}</strong>
            </Text>
            <Text size="sm" color="fg.muted">
              Italic: <strong>{String(italic)}</strong>
            </Text>
            <Text size="sm" color="fg.muted">
              Strike: <strong>{String(strike)}</strong>
            </Text>
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const RadioItems: Story = {
  render: () => {
    function Demo(): React.ReactElement {
      const [align, setAlign] = useState('left');
      return (
        <Stack gap="3">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <Target>Right-click to set alignment</Target>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>Text alignment</ContextMenuLabel>
              <ContextMenuRadioGroup value={align} onValueChange={setAlign}>
                <ContextMenuRadioItem value="left">Left</ContextMenuRadioItem>
                <ContextMenuRadioItem value="center">Center</ContextMenuRadioItem>
                <ContextMenuRadioItem value="right">Right</ContextMenuRadioItem>
                <ContextMenuRadioItem value="justify">Justify</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenu>
          <Text size="sm" color="fg.muted">
            align: <strong>{align}</strong>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const OnListItem: Story = {
  name: 'Use case — row context menu',
  render: () => (
    <Stack gap="2" minWidth="360px">
      <Heading level={4} size="sm">
        Files
      </Heading>
      {['budget-2026.xlsx', 'notes.md', 'brand.sketch'].map((name) => (
        <ContextMenu key={name}>
          <ContextMenuTrigger asChild>
            <Stack
              as="button"
              padding="3"
              borderRadius="sm"
              background="bg.surface"
              borderWidth="1"
              borderStyle="solid"
              borderColor="border.default"
              align="start"
              style={{ textAlign: 'left', cursor: 'default' }}
            >
              <Text size="sm">{name}</Text>
            </Stack>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open</ContextMenuItem>
            <ContextMenuItem>Download</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="danger">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Target>Right-click — some items disabled</Target>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Undo</ContextMenuItem>
        <ContextMenuItem disabled>Redo</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem disabled>Paste (empty clipboard)</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
