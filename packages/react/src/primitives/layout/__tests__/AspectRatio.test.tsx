import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AspectRatio } from '../AspectRatio/index.js';

describe('AspectRatio', () => {
  it('renders the child and sets the ratio CSS var', () => {
    const { container, getByAltText } = render(
      <AspectRatio ratio={16 / 9} data-testid="ar">
        <img src="x" alt="pic" />
      </AspectRatio>,
    );
    const el = container.querySelector('[data-testid="ar"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-aspect-ratio')).toBe(String(16 / 9));
    expect(getByAltText('pic')).toBeInTheDocument();
  });

  it('accepts string ratios', () => {
    const { container } = render(
      <AspectRatio ratio="4 / 3" data-testid="ar">
        <div>x</div>
      </AspectRatio>,
    );
    const el = container.querySelector('[data-testid="ar"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-aspect-ratio')).toBe('4 / 3');
  });
});
