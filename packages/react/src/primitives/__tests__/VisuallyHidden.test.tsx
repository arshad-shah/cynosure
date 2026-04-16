import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from '../VisuallyHidden.js';

describe('VisuallyHidden', () => {
  it('applies the canonical sr-only styles', () => {
    const { getByText } = render(<VisuallyHidden>hidden</VisuallyHidden>);
    const el = getByText('hidden');
    expect(el.style.position).toBe('absolute');
    expect(el.style.width).toBe('1px');
    expect(el.style.height).toBe('1px');
    expect(el.style.overflow).toBe('hidden');
    expect(el.style.whiteSpace).toBe('nowrap');
  });

  it('merges caller-supplied styles', () => {
    const { getByText } = render(<VisuallyHidden style={{ color: 'red' }}>hidden</VisuallyHidden>);
    const el = getByText('hidden');
    expect(el.style.color).toBe('red');
    expect(el.style.position).toBe('absolute');
  });
});
