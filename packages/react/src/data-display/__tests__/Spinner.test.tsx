import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from '../Spinner/index.js';

describe('Spinner', () => {
  it('exposes a status role with an accessible label', () => {
    render(<Spinner label="Saving" />);
    const el = screen.getByRole('status', { name: 'Saving' });
    expect(el).toBeInTheDocument();
  });

  it('defaults to "Loading" label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('supports dot and ring variants', () => {
    const { container, rerender } = render(<Spinner variant="dots" />);
    expect(container.querySelectorAll('span')).not.toHaveLength(0);
    rerender(<Spinner variant="ring" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
