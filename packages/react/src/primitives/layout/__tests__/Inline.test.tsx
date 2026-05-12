import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Inline } from '../Inline/index.js';

describe('Inline', () => {
  it('maps gap/align/justify/wrap to CSS variables', () => {
    const { container } = render(
      <Inline gap="2" align="center" justify="end" wrap={false} data-testid="inline">
        <span>a</span>
      </Inline>,
    );
    const el = container.querySelector('[data-testid="inline"]') as HTMLElement;
    // `gap` writes both longhand vars — see Inline.tsx comment.
    expect(el.style.getPropertyValue('--cynosure-inline-col-gap-base')).toBe(
      'var(--cynosure-space-2)',
    );
    expect(el.style.getPropertyValue('--cynosure-inline-row-gap-base')).toBe(
      'var(--cynosure-space-2)',
    );
    expect(el.style.getPropertyValue('--cynosure-inline-align-base')).toBe('center');
    expect(el.style.getPropertyValue('--cynosure-inline-justify-base')).toBe('flex-end');
    expect(el.style.getPropertyValue('--cynosure-inline-wrap-base')).toBe('nowrap');
  });

  it('supports separate row/column gaps', () => {
    const { container } = render(
      <Inline rowGap="2" columnGap="4" data-testid="inline">
        <span>a</span>
      </Inline>,
    );
    const el = container.querySelector('[data-testid="inline"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-inline-row-gap-base')).toBe(
      'var(--cynosure-space-2)',
    );
    expect(el.style.getPropertyValue('--cynosure-inline-col-gap-base')).toBe(
      'var(--cynosure-space-4)',
    );
  });
});
