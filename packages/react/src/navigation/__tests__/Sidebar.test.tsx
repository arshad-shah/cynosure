// packages/react/src/navigation/__tests__/Sidebar.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar, SidebarBody, SidebarProvider, SidebarTrigger } from '../Sidebar/index.js';

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
    const button = screen.getByRole('button', { name: /collapse sidebar/i });
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
