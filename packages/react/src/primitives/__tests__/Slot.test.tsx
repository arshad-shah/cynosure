import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slot } from '../Slot.js';

describe('Slot', () => {
  it('merges className and event handlers onto the child element', () => {
    const childClick = vi.fn();
    const slotClick = vi.fn();
    const { getByTestId } = render(
      <Slot className="outer" onClick={slotClick}>
        <a href="/docs" className="inner" data-testid="anchor" onClick={childClick}>
          docs
        </a>
      </Slot>,
    );
    const anchor = getByTestId('anchor');
    expect(anchor.tagName).toBe('A');
    expect(anchor.className.split(' ')).toEqual(expect.arrayContaining(['outer', 'inner']));
    anchor.click();
    expect(childClick).toHaveBeenCalled();
    expect(slotClick).toHaveBeenCalled();
  });
});
