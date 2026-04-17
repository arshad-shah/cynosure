import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '../EmptyState/index.js';

describe('EmptyState', () => {
  it('composes the full slot family', () => {
    render(
      <EmptyState size="md">
        <EmptyStateIcon>
          <svg aria-hidden="true" />
        </EmptyStateIcon>
        <EmptyStateTitle>No messages</EmptyStateTitle>
        <EmptyStateDescription>Your inbox is empty.</EmptyStateDescription>
        <EmptyStateActions>
          <button type="button">Compose</button>
        </EmptyStateActions>
      </EmptyState>,
    );
    expect(screen.getByRole('heading', { name: 'No messages' })).toBeInTheDocument();
    expect(screen.getByText('Your inbox is empty.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument();
  });
});
