import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  MenuBar,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarTrigger,
} from '../MenuBar/index.js';

describe('MenuBar', () => {
  it('renders top-level triggers as a menubar', () => {
    render(
      <MenuBar>
        <MenuBarMenu>
          <MenuBarTrigger>File</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem>New</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu>
          <MenuBarTrigger>Edit</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem>Copy</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
      </MenuBar>,
    );
    expect(screen.getByRole('menubar')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  function Bar() {
    return (
      <MenuBar>
        <MenuBarMenu>
          <MenuBarTrigger>File</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem>New</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu>
          <MenuBarTrigger>Edit</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem>Copy</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
      </MenuBar>
    );
  }

  it('opens a menu on click and exposes its items', async () => {
    const user = userEvent.setup();
    render(<Bar />);
    await user.click(screen.getByRole('menuitem', { name: 'File' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument();
  });

  it('moves focus between top-level triggers with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Bar />);
    const file = screen.getByRole('menuitem', { name: 'File' });
    file.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(file).toHaveFocus();
  });

  it('opens via ArrowDown and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Bar />);
    screen.getByRole('menuitem', { name: 'File' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});
