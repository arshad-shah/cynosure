import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from '../Alert/index.js';

describe('Alert', () => {
  it('renders with status role for info by default', () => {
    render(
      <Alert status="info">
        <AlertTitle>Heads up</AlertTitle>
      </Alert>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses alert role for danger/warning statuses', () => {
    const { rerender } = render(
      <Alert status="danger">
        <AlertTitle>!</AlertTitle>
      </Alert>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    rerender(
      <Alert status="warning">
        <AlertTitle>!</AlertTitle>
      </Alert>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('honours role override', () => {
    render(
      // biome-ignore lint/a11y/useSemanticElements: Alert is a div by design; overriding role to status is intentional.
      <Alert status="danger" role="status">
        <AlertTitle>Silent</AlertTitle>
      </Alert>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('fires onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Alert closable onClose={onClose}>
        <AlertTitle>x</AlertTitle>
      </Alert>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders title + description with shared ids', () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Body</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
