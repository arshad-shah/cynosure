import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from '../Tabs/index.js';

describe('Tabs', () => {
  function Harness({
    onValueChange,
    defaultValue = 'overview',
  }: { onValueChange?: (value: string) => void; defaultValue?: string } = {}) {
    return (
      <Tabs defaultValue={defaultValue} onValueChange={onValueChange}>
        <TabsList aria-label="Sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
          <TabsIndicator />
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="analytics">Analytics panel</TabsContent>
        <TabsContent value="reports">Reports panel</TabsContent>
      </Tabs>
    );
  }

  it('renders the active tab content by default', () => {
    render(<Harness />);
    expect(screen.getByText('Overview panel')).toBeInTheDocument();
    expect(screen.queryByText('Analytics panel')).not.toBeInTheDocument();
  });

  it('switches content when a different tab is clicked', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    await user.click(screen.getByRole('tab', { name: 'Analytics' }));
    expect(screen.getByText('Analytics panel')).toBeInTheDocument();
    expect(screen.queryByText('Overview panel')).not.toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith('analytics');
  });

  it('skips disabled triggers', () => {
    render(<Harness />);
    const reports = screen.getByRole('tab', { name: 'Reports' });
    expect(reports).toHaveAttribute('data-disabled');
  });

  it('has the expected ARIA roles', () => {
    render(<Harness />);
    expect(screen.getByRole('tablist')).toHaveAccessibleName('Sections');
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
});
