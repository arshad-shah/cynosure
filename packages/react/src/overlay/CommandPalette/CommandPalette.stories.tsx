import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, FileText, Hammer, Settings, Terminal, User } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Kbd } from '../../typography/Kbd/Kbd.js';
import { Text } from '../../typography/Text/Text.js';
import {
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandMenu,
  CommandSeparator,
} from './CommandPalette.js';

const meta: Meta<typeof CommandMenu> = {
  title: 'Overlays/CommandPalette',
  component: CommandMenu,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof CommandMenu>;

export const Default: Story = {
  render: () => {
    function Demo(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Stack gap="3">
          <Text size="sm" color="fg.muted">
            Press <Kbd>⌘K</Kbd> / <Kbd>Ctrl+K</Kbd>, or click the button.
          </Text>
          <div>
            <Button onClick={() => setOpen(true)}>Open palette</Button>
          </div>
          <CommandMenu open={open} onOpenChange={setOpen}>
            <CommandInput />
            <CommandList>
              <CommandEmpty />
              <CommandGroup heading="Navigation">
                <CommandItem icon={<FileText size={16} />} onSelect={() => setOpen(false)}>
                  Open file…
                </CommandItem>
                <CommandItem
                  icon={<User size={16} />}
                  shortcut="⌘ P"
                  onSelect={() => setOpen(false)}
                >
                  Go to profile
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem
                  icon={<Terminal size={16} />}
                  description="Run shell command in workspace"
                  shortcut="Ctrl+`"
                  onSelect={() => setOpen(false)}
                >
                  Open terminal
                </CommandItem>
                <CommandItem
                  icon={<Hammer size={16} />}
                  shortcut="⌘ B"
                  onSelect={() => setOpen(false)}
                >
                  Build project
                </CommandItem>
                <CommandItem
                  icon={<Settings size={16} />}
                  shortcut="⌘ ,"
                  onSelect={() => setOpen(false)}
                >
                  Settings
                </CommandItem>
                <CommandItem
                  icon={<ArrowRight size={16} />}
                  onSelect={() => setOpen(false)}
                  disabled
                >
                  Deploy (disabled)
                </CommandItem>
              </CommandGroup>
            </CommandList>
            <CommandFooter />
          </CommandMenu>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · open, type to filter',
  render: () => {
    function Demo(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Button onClick={() => setOpen(true)}>Open palette</Button>
          <CommandMenu open={open} onOpenChange={setOpen}>
            <CommandInput />
            <CommandList>
              <CommandEmpty />
              <CommandGroup heading="Navigation">
                <CommandItem icon={<FileText size={16} />}>Open file</CommandItem>
                <CommandItem icon={<User size={16} />}>Go to profile</CommandItem>
              </CommandGroup>
              <CommandGroup heading="Actions">
                <CommandItem icon={<Terminal size={16} />}>Open terminal</CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandMenu>
        </div>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open palette' }));
    // CommandMenu wraps a Dialog that portals to document.body.
    const body = within(document.body);
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(body.getByText('Open terminal')).toBeInTheDocument();
    // Typing filters the list down to matching items.
    const input = body.getByPlaceholderText('Type a command or search…');
    await userEvent.type(input, 'terminal');
    await waitFor(() => expect(body.queryByText('Open file')).not.toBeInTheDocument());
    await expect(body.getByText('Open terminal')).toBeInTheDocument();
    // A non-matching query shows the empty state.
    await userEvent.clear(input);
    await userEvent.type(input, 'zzzznope');
    await waitFor(() => expect(body.getByText('No results found.')).toBeInTheDocument());
  },
};
