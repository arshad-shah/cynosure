import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Notification } from '../Notification/index.js';

describe('Notification', () => {
  it('renders structured fields and a dismiss button', () => {
    const onDismiss = vi.fn();
    render(
      <Notification
        title="New comment"
        description="Arshad commented on your issue."
        timestamp="2 min ago"
        unread
        onDismiss={onDismiss}
      />,
    );
    expect(screen.getByText('New comment')).toBeInTheDocument();
    expect(screen.getByText('Arshad commented on your issue.')).toBeInTheDocument();
    expect(screen.getByText('2 min ago')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('invokes onRead when unread notification is clicked', () => {
    const onRead = vi.fn();
    render(<Notification unread title="Ping" onRead={onRead} />);
    fireEvent.click(screen.getByText('Ping'));
    expect(onRead).toHaveBeenCalledTimes(1);
  });
});
