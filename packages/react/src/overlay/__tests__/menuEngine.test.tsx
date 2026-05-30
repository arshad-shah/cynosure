import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../DropdownMenu/index.js';

/**
 * Behavioural coverage for the first-party menu engine (the replacement for
 * the Radix menu packages). Focuses on the keyboard + focus contracts that
 * the engine now owns directly.
 */
describe('menu engine — keyboard & focus', () => {
  async function openMenu(user: ReturnType<typeof userEvent.setup>, name = 'Menu') {
    const trigger = screen.getByRole('button', { name });
    trigger.focus();
    await user.keyboard('{Enter}');
    return trigger;
  }

  it('highlights the first item on keyboard open and wraps with ArrowUp/Down', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuItem>Two</DropdownMenuItem>
          <DropdownMenuItem>Three</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await openMenu(user);
    expect(screen.getByRole('menuitem', { name: 'One' })).toHaveAttribute('data-highlighted');

    // ArrowUp from the first item wraps to the last.
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Three' })).toHaveAttribute('data-highlighted');

    // ArrowDown from the last item wraps back to the first.
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'One' })).toHaveAttribute('data-highlighted');
  });

  it('skips disabled items during arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuItem disabled>Two</DropdownMenuItem>
          <DropdownMenuItem>Three</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await openMenu(user);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Three' })).toHaveAttribute('data-highlighted');
    expect(screen.getByRole('menuitem', { name: 'Two' })).not.toHaveAttribute('data-highlighted');
  });

  it('moves to a matching item via type-ahead', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Apple</DropdownMenuItem>
          <DropdownMenuItem>Banana</DropdownMenuItem>
          <DropdownMenuItem>Cherry</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await openMenu(user);
    await user.keyboard('c');
    expect(screen.getByRole('menuitem', { name: 'Cherry' })).toHaveAttribute('data-highlighted');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = await openMenu(user);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes on an outside pointer press', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">outside</button>
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>One</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>,
    );
    await openMenu(user);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'outside' }));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('selects a radio item and reflects aria-checked', async () => {
    function Harness() {
      const [value, setValue] = useState('asc');
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
              <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    await openMenu(user);
    expect(screen.getByRole('menuitemradio', { name: 'Ascending' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // Move to the second radio item and select it (which closes the menu).
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    // Reopen to inspect the committed selection.
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menuitemradio', { name: 'Descending' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('opens a submenu from a SubTrigger', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Top</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await openMenu(user);
    const subTrigger = screen.getByRole('menuitem', { name: 'More' });
    expect(subTrigger).toHaveAttribute('aria-expanded', 'false');
    // ArrowDown to the SubTrigger, then ArrowRight opens the submenu.
    await user.keyboard('{ArrowDown}{ArrowRight}');
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Nested' })).toBeInTheDocument();
    });
    expect(subTrigger).toHaveAttribute('aria-expanded', 'true');
  });
});
