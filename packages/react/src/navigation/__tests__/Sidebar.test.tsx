// packages/react/src/navigation/__tests__/Sidebar.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Sidebar,
  SidebarBody,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
  SidebarSubItem,
  SidebarSubNav,
  SidebarTrigger,
} from '../Sidebar/index.js';

describe('Sidebar shell', () => {
  it('renders an aside with data attributes reflecting provider state', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="Primary">
          <SidebarBody>content</SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByRole('complementary', { name: 'Primary' });
    expect(aside).toHaveAttribute('data-collapsed', 'false');
    expect(aside).toHaveAttribute('data-side', 'left');
    expect(aside).toHaveAttribute('data-collapsible', 'icon');
  });

  it('uncontrolled SidebarTrigger toggles collapsed', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="Primary">
          <SidebarTrigger />
        </Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByRole('complementary', { name: 'Primary' });
    const button = screen.getByRole('button', { name: /^collapse$/i });
    expect(aside).toHaveAttribute('data-collapsed', 'false');
    fireEvent.click(button);
    expect(aside).toHaveAttribute('data-collapsed', 'true');
  });

  it('controlled collapsed calls onCollapsedChange and does not update internally', () => {
    const onChange = vi.fn();
    render(
      <SidebarProvider collapsed={false} onCollapsedChange={onChange}>
        <Sidebar aria-label="Primary">
          <SidebarTrigger />
        </Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByRole('complementary', { name: 'Primary' });
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(aside).toHaveAttribute('data-collapsed', 'false');
  });
});

describe('SidebarItem', () => {
  it('renders icon, label, badge, and aria-current when active', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<svg data-testid="ic" />} label="Inbox" badge="3" isActive />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button', { name: /inbox/i });
    expect(btn).toHaveAttribute('aria-current', 'page');
    expect(btn).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('ic')).toBeInTheDocument();
    expect(btn).toHaveTextContent('3');
  });

  it('asChild forwards onto an anchor', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem asChild label="Home">
                <a href="/home">Home</a>
              </SidebarItem>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const link = screen.getByRole('link', { name: /home/i });
    expect(link).toHaveAttribute('href', '/home');
  });

  it('does not wrap in tooltip when expanded', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    // Tooltip content is rendered in a portal only on open; we assert the
    // trigger is not a Radix tooltip trigger by checking for data attribute.
    const btn = screen.getByRole('button', { name: /inbox/i });
    expect(btn).not.toHaveAttribute('data-state');
  });

  it('wraps in tooltip when collapsed to icon rail', async () => {
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button', { name: /inbox/i });
    // Radix tooltip adds data-state to the trigger once it mounts.
    expect(btn).toHaveAttribute('data-state');
  });
});

describe('SidebarGroup', () => {
  it('collapsible group toggles aria-expanded', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarGroup label="Admin" collapsible defaultOpen>
                <SidebarItem label="Members" />
              </SidebarGroup>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const toggle = screen.getByRole('button', { expanded: true });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('SidebarSubNav', () => {
  it('renders inline when expanded', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarSubNav
                parentLabel="Settings"
                defaultOpen
                trigger={<SidebarItem label="Settings" />}
              >
                <SidebarSubItem>Billing</SidebarSubItem>
                <SidebarSubItem isActive>Team</SidebarSubItem>
              </SidebarSubNav>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByRole('button', { name: 'Billing' })).toBeInTheDocument();
    const team = screen.getByRole('button', { name: 'Team' });
    expect(team).toHaveAttribute('aria-current', 'page');
  });
});
