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

  it('defaults type to button (not submit)', () => {
    render(<IconButton icon={<svg />} label="x" />);
    expect(screen.getByRole('button', { name: 'x' }).getAttribute('type')).toBe('button');
  });

  describe('variant="bare"', () => {
    it('still enforces aria-label and default type="button"', () => {
      render(<IconButton variant="bare" icon={<svg data-testid="i" />} label="Close" />);
      const btn = screen.getByRole('button', { name: 'Close' });
      expect(btn.getAttribute('aria-label')).toBe('Close');
      expect(btn.getAttribute('type')).toBe('button');
      expect(screen.getByTestId('i')).toBeInTheDocument();
    });

    it('forwards className untouched (no Button recipe classes added)', () => {
      render(
        <IconButton variant="bare" icon={<svg />} label="X" className="my-close" data-testid="b" />,
      );
      const btn = screen.getByTestId('b');
      expect(btn.className).toBe('my-close');
    });

    it('forwards onClick and arbitrary button attributes', () => {
      let hits = 0;
      render(
        <IconButton
          variant="bare"
          icon={<svg />}
          label="X"
          aria-pressed
          onClick={() => {
            hits++;
          }}
          data-testid="b"
        />,
      );
      screen.getByTestId('b').click();
      expect(hits).toBe(1);
      expect(screen.getByTestId('b').getAttribute('aria-pressed')).toBe('true');
    });
  });
});
