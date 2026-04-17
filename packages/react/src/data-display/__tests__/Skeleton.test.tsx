import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from '../Skeleton/index.js';

describe('Skeleton', () => {
  it('respects width/height and aspect ratio', () => {
    const { container } = render(<Skeleton width={120} height="2rem" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('2rem');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies variant data-attribute', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.firstChild).toHaveAttribute('data-variant', 'circle');
  });
});
