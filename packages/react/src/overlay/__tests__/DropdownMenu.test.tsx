import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuTriggerButton,
} from '../DropdownMenu/index.js';

describe('DropdownMenu', () => {
  function Harness({
    onSelect,
    onCheckedChange,
  }: {
    onSelect?: () => void;
    onCheckedChange?: (value: boolean) => void;
  } = {}) {
    const [checked, setChecked] = useState(false);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={checked}
            onCheckedChange={(value) => {
              setChecked(value);
              onCheckedChange?.(value);
            }}
          >
            Star
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  it('opens when the trigger is activated via keyboard', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Star' })).toBeInTheDocument();
  });

  it('fires onSelect and closes when an item is chosen', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}'); // first item already highlighted
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('toggles checkbox items', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Harness onCheckedChange={onCheckedChange} />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('renders an icon in the leading slot and a description line', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            icon={<span data-testid="edit-icon">i</span>}
            description="Change the document title"
          >
            Rename
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    expect(screen.getByText('Change the document title')).toBeInTheDocument();
  });

  it('applies data-variant="danger" when variant="danger" is set', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    const item = screen.getByRole('menuitem', { name: 'Delete' });
    expect(item).toHaveAttribute('data-variant', 'danger');
  });

  it('omits data-variant for the default variant', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    const item = screen.getByRole('menuitem', { name: 'Rename' });
    expect(item).not.toHaveAttribute('data-variant');
  });

  it('DropdownMenuTriggerButton exposes data-state when menu is open', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTriggerButton>Actions</DropdownMenuTriggerButton>
        <DropdownMenuContent>
          <DropdownMenuItem>First</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: /Actions/ });
    expect(trigger).toHaveAttribute('data-state', 'closed');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('data-state', 'open');
  });
});
