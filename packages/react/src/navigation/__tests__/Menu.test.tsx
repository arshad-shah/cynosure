import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Menu, MenuDivider, MenuGroup, MenuItem } from '../Menu/index.js';

describe('Menu', () => {
  it('renders a nav with items and honours isActive', () => {
    render(
      <Menu aria-label="Main">
        <MenuItem isActive>Home</MenuItem>
        <MenuItem>Settings</MenuItem>
      </Menu>,
    );
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const home = screen.getByRole('button', { name: 'Home' });
    expect(nav).toContainElement(home);
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(home).toHaveAttribute('data-active', 'true');
  });

  it('renders MenuItem as an anchor when href is provided', () => {
    render(
      <Menu>
        <MenuItem href="/settings">Settings</MenuItem>
      </Menu>,
    );
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('disables items and prevents clicks when disabled', () => {
    const onClick = vi.fn();
    render(
      <Menu>
        <MenuItem disabled onClick={onClick}>
          Profile
        </MenuItem>
      </Menu>,
    );
    const button = screen.getByRole('button', { name: 'Profile' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('collapsible MenuGroup toggles aria-expanded and visibility', () => {
    render(
      <Menu>
        <MenuGroup label="Workspace" collapsible defaultOpen>
          <MenuItem>Project A</MenuItem>
        </MenuGroup>
      </Menu>,
    );
    const toggle = screen.getByRole('button', { expanded: true });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders a MenuDivider as an <hr>', () => {
    const { container } = render(
      <Menu>
        <MenuItem>One</MenuItem>
        <MenuDivider />
        <MenuItem>Two</MenuItem>
      </Menu>,
    );
    expect(container.querySelector('hr')).not.toBeNull();
  });
});
