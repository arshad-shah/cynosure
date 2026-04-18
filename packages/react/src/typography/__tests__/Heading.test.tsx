import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading } from '../Heading/index.js';

describe('Heading', () => {
  it('renders an <h2> by default', () => {
    const { container } = render(<Heading>hi</Heading>);
    const el = container.querySelector('h2');
    expect(el?.textContent).toBe('hi');
  });

  it('renders <h1>..<h6> per level', () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      const { container } = render(
        <Heading level={level} data-testid={`h-${level}`}>
          hi
        </Heading>,
      );
      const el = container.querySelector(`[data-testid="h-${level}"]`);
      expect(el?.tagName).toBe(`H${level}`);
    }
  });

  it('uses the matching heading composite token by default per level', () => {
    const { container } = render(
      <Heading level={1} data-testid="h">
        hi
      </Heading>,
    );
    const el = container.querySelector('[data-testid="h"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-heading-size-base')).toBe(
      'var(--cynosure-font-heading-1-size)',
    );
    expect(el.style.getPropertyValue('--cynosure-heading-weight-base')).toBe(
      'var(--cynosure-font-heading-1-weight)',
    );
  });

  it('decouples visual size from semantic level — h1 with size="xs" renders <h1> at body-xs size', () => {
    const { container } = render(
      <Heading level={1} size="xs" data-testid="h">
        tiny h1
      </Heading>,
    );
    const el = container.querySelector('[data-testid="h"]') as HTMLElement;
    expect(el.tagName).toBe('H1');
    expect(el.style.getPropertyValue('--cynosure-heading-size-base')).toBe(
      'var(--cynosure-font-body-xs-size)',
    );
  });

  it('applies explicit weight override on top of the level default', () => {
    const { container } = render(
      <Heading level={2} weight="regular" data-testid="h">
        x
      </Heading>,
    );
    const el = container.querySelector('[data-testid="h"]') as HTMLElement;
    // Explicit weight wins — `weight="regular"` writes the variable after the
    // level default does.
    expect(el.style.getPropertyValue('--cynosure-heading-weight-base')).toBe(
      'var(--cynosure-font-weight-regular)',
    );
  });

  it('applies `truncate={3}` via the line-clamp class', () => {
    const { container } = render(
      <Heading truncate={3} data-testid="h">
        multi line
      </Heading>,
    );
    const el = container.querySelector('[data-testid="h"]') as HTMLElement;
    expect(el.className).toMatch(/lineClamp/);
    expect(el.style.getPropertyValue('--cynosure-typography-line-clamp')).toBe('3');
  });

  it('asChild projects Heading onto a custom child', () => {
    const { container } = render(
      <Heading asChild level={3}>
        <a href="/section-3">Section 3</a>
      </Heading>,
    );
    const a = container.querySelector('a') as HTMLAnchorElement;
    expect(a?.getAttribute('href')).toBe('/section-3');
    // the child, not h3, is rendered — asChild defers semantic element to the child
    expect(container.querySelector('h3')).toBeNull();
  });
});
