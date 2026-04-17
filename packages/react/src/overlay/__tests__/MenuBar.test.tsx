import { render, screen } from '@testing-library/react';
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
});
