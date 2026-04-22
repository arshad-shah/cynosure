// packages/react/src/navigation/__tests__/Sidebar.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('renders the flyout popover when collapsed', () => {
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarSubNav
                parentLabel="Settings"
                defaultOpen
                trigger={<SidebarItem label="Settings" />}
              >
                <SidebarSubItem>Billing</SidebarSubItem>
              </SidebarSubNav>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByRole('button', { name: 'Billing' })).toBeInTheDocument();
  });
});

describe('SidebarGroup controlled', () => {
  it('controlled open prop calls onOpenChange without updating internal state', () => {
    const onOpenChange = vi.fn();
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarGroup label="Admin" collapsible open={false} onOpenChange={onOpenChange}>
                <SidebarItem label="Members" />
              </SidebarGroup>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const toggle = screen.getByRole('button', { expanded: false });
    fireEvent.click(toggle);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders action slot alongside label', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarGroup
                label="Projects"
                action={
                  <button type="button" aria-label="New project">
                    +
                  </button>
                }
              >
                <SidebarItem label="Alpha" />
              </SidebarGroup>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByRole('button', { name: 'New project' })).toBeInTheDocument();
  });
});

describe('SidebarTrigger tooltip', () => {
  it('wraps in tooltip when rail is collapsed', () => {
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarTrigger />
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button', { name: /expand/i });
    expect(btn).toHaveAttribute('data-state');
  });

  it('honours label override and hideLabel', () => {
    render(
      <SidebarProvider>
        <SidebarTrigger label="Menu" hideLabel icon={<span data-testid="custom-icon" />} />
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button', { name: 'Menu' });
    expect(btn).toHaveTextContent('');
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('respects defaultPrevented on click', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarTrigger onClick={(e) => e.preventDefault()} />
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByRole('complementary', { name: 'S' });
    fireEvent.click(screen.getByRole('button'));
    expect(aside).toHaveAttribute('data-collapsed', 'false');
  });
});

describe('SidebarSubNav controlled', () => {
  it('controlled open prop calls onOpenChange when collapsed toggle occurs', () => {
    const onOpenChange = vi.fn();
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarSubNav
                parentLabel="Settings"
                open={false}
                onOpenChange={onOpenChange}
                trigger={<SidebarItem label="Settings" />}
              >
                <SidebarSubItem>Billing</SidebarSubItem>
              </SidebarSubNav>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const trigger = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders inline without a trigger element', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarSubNav defaultOpen>
                <SidebarSubItem>Child</SidebarSubItem>
              </SidebarSubNav>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByRole('button', { name: 'Child' })).toBeInTheDocument();
  });
});

describe('SidebarSubItem', () => {
  it('respects disabled and asChild', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarSubItem disabled>Disabled</SidebarSubItem>
              <SidebarSubItem asChild>
                <a href="/x">Linked</a>
              </SidebarSubItem>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Linked' })).toHaveAttribute('href', '/x');
  });
});

describe('Sidebar mobile', () => {
  const originalMatchMedia = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('trigger toggles mobileOpen (controlled calls onMobileOpenChange)', () => {
    const onChange = vi.fn();
    render(
      <SidebarProvider mobileOpen onMobileOpenChange={onChange}>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('trigger default label switches with mobileOpen state (uncontrolled)', () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAccessibleName('Open');
    fireEvent.click(btn);
    expect(btn).toHaveAccessibleName('Close');
  });
});

describe('useRovingFocus edge cases', () => {
  it('skips aria-disabled items and focuses first when nothing focused', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem label="A" />
              <SidebarItem label="B" disabled />
              <SidebarItem label="C" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    fireEvent.keyDown(nav, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'A' }));
    fireEvent.keyDown(nav, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'C' }));
  });
});

describe('SidebarItem edge cases', () => {
  it('disabled item swallows clicks', () => {
    const onClick = vi.fn();
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem label="Settings" disabled onClick={onClick} />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('tooltip={false} opts out of collapsed-mode tooltip', () => {
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem label="Inbox" tooltip={false} />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button', { name: 'Inbox' });
    expect(btn).not.toHaveAttribute('data-state');
  });

  it('custom tooltip overrides label', () => {
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem label="Inbox" tooltip="Mail" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByRole('button', { name: 'Inbox' })).toHaveAttribute('data-state');
  });
});
