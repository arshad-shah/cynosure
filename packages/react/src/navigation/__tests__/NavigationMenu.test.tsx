import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../NavigationMenu/index.js';

describe('NavigationMenu', () => {
  it('renders triggers inside a menubar-style list', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/a">A</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/pricing" active>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByRole('button', { name: /Products/ })).toBeInTheDocument();
    const pricing = screen.getByRole('link', { name: 'Pricing' });
    expect(pricing).toHaveAttribute('aria-current', 'page');
  });

  it('supports hiding the chevron caret on the trigger', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger hideChevron>Plain</NavigationMenuTrigger>
            <NavigationMenuContent>x</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(container.querySelector('svg')).toBeNull();
  });

  it('omits aria-current on inactive links', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/a">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const a = screen.getByRole('link', { name: 'A' });
    expect(a).not.toHaveAttribute('aria-current');
  });
});
