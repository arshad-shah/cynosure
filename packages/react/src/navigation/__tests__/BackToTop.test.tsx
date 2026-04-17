import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BackToTop } from '../BackToTop/index.js';

describe('BackToTop', () => {
  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });

  it('is hidden initially and shows after scroll passes the threshold', async () => {
    render(<BackToTop showAfter={200} disablePortal />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button).toHaveAttribute('data-visible', 'false');

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    // The scroll listener is throttled; the trailing call runs ≤ 100ms later.
    await waitFor(() => expect(button).toHaveAttribute('data-visible', 'true'));
  });

  it('scrolls to the top when clicked', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo });
    render(<BackToTop disablePortal />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });
});
