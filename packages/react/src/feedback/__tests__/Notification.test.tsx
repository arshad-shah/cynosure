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

  it('renders icon, actions, and the unread dot', () => {
    const { container } = render(
      <Notification
        icon={<span data-testid="icon">!</span>}
        title="t"
        actions={<button type="button">Act</button>}
        unread
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('falls back to children when no structured fields are passed', () => {
    render(<Notification>Hello</Notification>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('stops dismiss-button click from triggering onRead', () => {
    const onRead = vi.fn();
    const onDismiss = vi.fn();
    render(<Notification unread title="x" onRead={onRead} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(onDismiss).toHaveBeenCalled();
    expect(onRead).not.toHaveBeenCalled();
  });

  it('does not call onRead when not unread', () => {
    const onRead = vi.fn();
    render(<Notification title="t" onRead={onRead} />);
    fireEvent.click(screen.getByText('t'));
    expect(onRead).not.toHaveBeenCalled();
  });

  it('respects a custom dismissLabel and forwards an outer onClick', () => {
    const onClick = vi.fn();
    render(
      <Notification title="x" onClick={onClick} onDismiss={() => {}} dismissLabel="Close it" />,
    );
    fireEvent.click(screen.getByText('x'));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Close it' })).toBeInTheDocument();
  });
});
