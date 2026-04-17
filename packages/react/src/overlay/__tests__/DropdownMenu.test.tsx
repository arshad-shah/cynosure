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
});
