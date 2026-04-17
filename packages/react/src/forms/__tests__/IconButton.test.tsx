import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconButton } from '../IconButton/index.js';

describe('IconButton', () => {
  it('applies the required aria-label', () => {
    render(<IconButton icon={<svg data-testid="i" />} label="Open menu" />);
    const btn = screen.getByRole('button', { name: 'Open menu' });
    expect(btn.getAttribute('aria-label')).toBe('Open menu');
    expect(screen.getByTestId('i')).toBeInTheDocument();
  });
});
