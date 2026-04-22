import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

  it('renders a vertical separator as an <hr> with role="separator" and aria-orientation="vertical"', () => {
    const { container } = render(<Divider orientation="vertical" decorative={false} />);
    const el = container.querySelector('hr[role="separator"]') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('applies thickness via CSS custom property', () => {
    const { container } = render(<Divider thickness="2" />);
    const el = container.querySelector('hr') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-divider-thickness')).toBe('2px');
  });

  it('renders a labeled divider as a <div role="separator"> with the label text', () => {
    const { container, getByText } = render(<Divider decorative={false}>or</Divider>);
    expect(container.querySelector('hr')).toBeNull();
    const el = container.querySelector('div[role="separator"]') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.getAttribute('aria-orientation')).toBe('horizontal');
    expect(getByText('or')).toBeTruthy();
  });

  it('labeled + decorative uses presentation role and aria-hidden', () => {
    const { container } = render(<Divider>label</Divider>);
    const el = container.querySelector('div[role="presentation"]') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('ignores children when orientation is vertical and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<Divider orientation="vertical">nope</Divider>);
    expect(container.querySelector('hr')).not.toBeNull();
    expect(container.querySelector('div[role]')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('applies length as width on horizontal hr', () => {
    const { container } = render(<Divider length="200px" />);
    const el = container.querySelector('hr') as HTMLElement;
    expect(el.style.width).toBe('200px');
  });

  it('applies length as --cynosure-divider-length on vertical hr', () => {
    const { container } = render(<Divider orientation="vertical" length="100px" />);
    const el = container.querySelector('hr') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-divider-length')).toBe('100px');
  });

  it('applies length as width on labeled (horizontal) divider', () => {
    const { container } = render(<Divider length="300px">label</Divider>);
    const el = container.querySelector('div[role]') as HTMLElement;
    expect(el.style.width).toBe('300px');
  });

  it('applies spacing as marginBlock on horizontal divider', () => {
    const { container } = render(<Divider spacing="4" />);
    const el = container.querySelector('hr') as HTMLElement;
    expect(el.style.marginBlock).toContain('var(');
  });

  it('applies spacing as marginInline on vertical divider', () => {
    const { container } = render(<Divider orientation="vertical" spacing="4" />);
    const el = container.querySelector('hr') as HTMLElement;
    expect(el.style.marginInline).toContain('var(');
  });

  it('uses dashed and dotted variant classes', () => {
    const { container: dashed } = render(<Divider variant="dashed" />);
    const { container: dotted } = render(<Divider variant="dotted" />);
    expect(dashed.querySelector('hr')?.className).toBeTruthy();
    expect(dotted.querySelector('hr')?.className).toBeTruthy();
  });

  it('renders soft + tone="default" + labelAlign variants', () => {
    const { container } = render(
      <Divider soft tone="default" labelAlign="start">
        L
      </Divider>,
    );
    expect(container.querySelector('div[role]')).not.toBeNull();
  });

  it('treats null children as no label and renders hr', () => {
    const { container } = render(<Divider>{null}</Divider>);
    expect(container.querySelector('hr')).not.toBeNull();
  });
});
