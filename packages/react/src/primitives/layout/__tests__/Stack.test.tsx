import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Stack } from '../Stack/index.js';

describe('Stack', () => {
  it('renders children in a flex column', () => {
    const { container } = render(
      <Stack data-testid="stack">
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    const el = container.querySelector('[data-testid="stack"]') as HTMLElement;
    expect(el?.children).toHaveLength(2);
  });

  it('maps `gap`/`align`/`justify` to CSS variables', () => {
    const { container } = render(
      <Stack gap="4" align="center" justify="between" data-testid="stack">
        <span>a</span>
      </Stack>,
    );
    const el = container.querySelector('[data-testid="stack"]') as HTMLElement;
    expect(el.style.getPropertyValue('--lumen-stack-gap-base')).toBe('var(--lumen-space-4)');
    expect(el.style.getPropertyValue('--lumen-stack-align-base')).toBe('center');
    expect(el.style.getPropertyValue('--lumen-stack-justify-base')).toBe('space-between');
  });

  it('inserts <hr> dividers between children when `dividers` is true', () => {
    const { container } = render(
      <Stack dividers data-testid="stack">
        <span data-testid="a">a</span>
        <span data-testid="b">b</span>
        <span data-testid="c">c</span>
      </Stack>,
    );
    const el = container.querySelector('[data-testid="stack"]') as HTMLElement;
    const hrs = el.querySelectorAll('hr');
    expect(hrs.length).toBe(2);
  });

  it('uses a custom divider when `dividers` is a node', () => {
    const { container } = render(
      <Stack dividers={<span data-testid="sep">|</span>} data-testid="stack">
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    const el = container.querySelector('[data-testid="stack"]') as HTMLElement;
    expect(el.querySelectorAll('[data-testid="sep"]').length).toBe(1);
  });

  it('renders as="ul" when requested', () => {
    const { container } = render(
      <Stack as="ul" data-testid="stack">
        <li>a</li>
      </Stack>,
    );
    const el = container.querySelector('[data-testid="stack"]') as HTMLElement;
    expect(el.tagName).toBe('UL');
  });
});
