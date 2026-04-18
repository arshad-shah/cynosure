import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Box } from '../Box/index.js';
import { Grid } from '../Grid/index.js';

describe('Grid', () => {
  it('expands `columns={N}` to `repeat(N, minmax(0, 1fr))`', () => {
    const { container } = render(
      <Grid columns={3} gap="4" data-testid="grid">
        <span>a</span>
      </Grid>,
    );
    const el = container.querySelector('[data-testid="grid"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-grid-cols-base')).toBe(
      'repeat(3, minmax(0, 1fr))',
    );
    expect(el.style.getPropertyValue('--cynosure-grid-gap-base')).toBe('var(--cynosure-space-4)');
  });

  it('passes `templateColumns` through verbatim', () => {
    const { container } = render(
      <Grid templateColumns="200px 1fr 200px" data-testid="grid">
        <span>a</span>
      </Grid>,
    );
    const el = container.querySelector('[data-testid="grid"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-grid-cols-base')).toBe('200px 1fr 200px');
  });

  it('supports responsive `columns` maps', () => {
    const { container } = render(
      <Grid columns={{ base: 1, md: 3 }} data-testid="grid">
        <span>a</span>
      </Grid>,
    );
    const el = container.querySelector('[data-testid="grid"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-grid-cols-base')).toBe(
      'repeat(1, minmax(0, 1fr))',
    );
    expect(el.style.getPropertyValue('--cynosure-grid-cols-md')).toBe('repeat(3, minmax(0, 1fr))');
  });

  it('forwards `gridColumn` from LayoutProps onto a Box child', () => {
    const { container } = render(
      <Grid columns={4} data-testid="grid">
        <Box gridColumn="span 2" data-testid="cell">
          a
        </Box>
      </Grid>,
    );
    const cell = container.querySelector('[data-testid="cell"]') as HTMLElement;
    expect(cell.style.getPropertyValue('--cynosure-lp-gc-base')).toBe('span 2');
  });
});
