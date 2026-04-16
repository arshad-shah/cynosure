import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spacer } from '../Spacer/index.js';

describe('Spacer', () => {
  it('renders an aria-hidden div by default', () => {
    const { container } = render(<Spacer />);
    const el = container.querySelector('div');
    expect(el?.getAttribute('aria-hidden')).toBe('true');
  });

  it('honours a passed className', () => {
    const { container } = render(<Spacer className="extra" />);
    const el = container.querySelector('div') as HTMLElement;
    expect(el.className).toMatch(/extra/);
  });
});
