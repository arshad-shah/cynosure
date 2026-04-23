import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Kbd } from '../Kbd/index.js';

describe('Kbd', () => {
  it('renders a <kbd> and swaps modifier glyphs for icons', () => {
    const { container } = render(<Kbd>⌘K</Kbd>);
    const el = container.querySelector('kbd');
    expect(el).not.toBeNull();
    // ⌘ is swapped for a lucide icon; K stays as text.
    expect(el?.querySelector('svg')).not.toBeNull();
    expect(el?.textContent).toBe('K');
  });

  it('renders plain text unchanged when no modifier glyphs are present', () => {
    const { container } = render(<Kbd>Enter</Kbd>);
    const el = container.querySelector('kbd');
    expect(el?.textContent).toBe('Enter');
    expect(el?.querySelector('svg')).toBeNull();
  });

  it('applies size class', () => {
    const { container } = render(
      <Kbd size="lg" data-testid="k">
        Enter
      </Kbd>,
    );
    const el = container.querySelector('[data-testid="k"]') as HTMLElement;
    expect(el.className).toMatch(/lg/);
  });
});
