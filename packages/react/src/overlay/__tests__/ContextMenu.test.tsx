import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
});
