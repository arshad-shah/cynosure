import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ContextMenu/index.js';

describe('ContextMenu', () => {
  it('opens on right-click and renders menu items', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger-area">Right-click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.contextMenu(screen.getByTestId('trigger-area'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Copy' })).toBeInTheDocument();
  });

  it('passes data-variant="danger" through the kit', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger-area">Right-click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="danger">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('trigger-area'));
    const item = screen.getByRole('menuitem', { name: 'Delete' });
    expect(item).toHaveAttribute('data-variant', 'danger');
  });

  it('navigates items by keyboard and selects, then closes on Escape', async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger-area">Right-click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onCopy}>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('trigger-area'));
    // ArrowDown highlights the first item, ArrowDown again the second.
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Copy' })).toHaveAttribute('data-highlighted');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Paste' })).toHaveAttribute('data-highlighted');
    // Back up and activate the first item.
    await user.keyboard('{ArrowUp}{Enter}');
    expect(onCopy).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});
