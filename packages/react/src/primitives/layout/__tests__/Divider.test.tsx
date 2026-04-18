import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Divider } from '../Divider/index.js';

describe('Divider', () => {
  it('renders an <hr> by default', () => {
    const { container } = render(<Divider />);
    const el = container.querySelector('hr');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('aria-hidden')).toBe('true');
  });

  it('exposes role="separator" when non-decorative', () => {
    const { container } = render(<Divider decorative={false} />);
    const el = container.querySelector('hr') as HTMLElement;
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.hasAttribute('aria-hidden')).toBe(false);
  });

  it('renders a vertical separator as a div with role="separator" and aria-orientation', () => {
    const { container } = render(<Divider orientation="vertical" decorative={false} />);
    const el = container.querySelector('div[role="separator"]') as HTMLElement;
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('applies thickness via CSS custom property', () => {
    const { container } = render(<Divider thickness="2" />);
    const el = container.querySelector('hr') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-divider-thickness')).toBe('2px');
  });
});
