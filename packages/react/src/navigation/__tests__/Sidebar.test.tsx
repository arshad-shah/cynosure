import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installMatchMediaMock } from '../../test/matchMedia.js';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '../Sidebar/index.js';

describe('Sidebar', () => {
  let media: ReturnType<typeof installMatchMediaMock>;

  beforeEach(() => {
    media = installMatchMediaMock({ '(max-width: 47.99em)': false });
  });

  afterEach(() => {
    media.reset();
  });

  it('toggles collapse state on desktop when the trigger is clicked', () => {
    render(
      <SidebarProvider>
        <Sidebar data-testid="sidebar">
          <SidebarHeader>Header</SidebarHeader>
          <SidebarBody>Body</SidebarBody>
          <SidebarFooter>Footer</SidebarFooter>
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  });

  it('renders as a Drawer on mobile and opens when trigger is clicked', () => {
    media.set('(max-width: 47.99em)', true);
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarBody>mobile body</SidebarBody>
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    // Drawer content is portalled; before open, body is absent from the DOM.
    expect(screen.queryByText('mobile body')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('mobile body')).toBeInTheDocument();
  });
});
