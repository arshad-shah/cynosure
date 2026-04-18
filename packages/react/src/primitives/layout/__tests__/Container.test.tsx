import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Container } from '../Container/index.js';

describe('Container', () => {
  it('renders as a div by default', () => {
    const { container } = render(<Container data-testid="c">x</Container>);
    const el = container.querySelector('[data-testid="c"]') as HTMLElement;
    expect(el.tagName).toBe('DIV');
  });

  it('applies the default `lg` size class', () => {
    const { container } = render(<Container data-testid="c">x</Container>);
    const el = container.querySelector('[data-testid="c"]') as HTMLElement;
    // Two classes: containerBase + containerSize.lg
    expect(el.className.split(' ').length).toBeGreaterThanOrEqual(2);
  });

  it('supports paddingX layout prop for gutters', () => {
    const { container } = render(
      <Container paddingX="4" data-testid="c">
        x
      </Container>,
    );
    const el = container.querySelector('[data-testid="c"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-lp-px-base')).toBe('var(--cynosure-space-4)');
  });
});
