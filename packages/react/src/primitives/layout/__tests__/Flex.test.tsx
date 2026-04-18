import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Flex } from '../Flex/index.js';

describe('Flex', () => {
  it('maps direction/grow/shrink/basis to CSS variables', () => {
    const { container } = render(
      <Flex direction="row-reverse" grow={1} shrink={0} basis="auto" data-testid="flex">
        <span>a</span>
      </Flex>,
    );
    const el = container.querySelector('[data-testid="flex"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-flex-dir-base')).toBe('row-reverse');
    expect(el.style.getPropertyValue('--cynosure-flex-grow-base')).toBe('1');
    expect(el.style.getPropertyValue('--cynosure-flex-shrink-base')).toBe('0');
    expect(el.style.getPropertyValue('--cynosure-flex-basis-base')).toBe('auto');
  });

  it('handles baseline alignment', () => {
    const { container } = render(
      <Flex align="baseline" data-testid="flex">
        <span>a</span>
      </Flex>,
    );
    const el = container.querySelector('[data-testid="flex"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-flex-align-base')).toBe('baseline');
  });
});
