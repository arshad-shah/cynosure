import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Box } from '../Box/index.js';

describe('Box', () => {
  it('renders a div by default', () => {
    const { container } = render(<Box data-testid="box">hello</Box>);
    const el = container.querySelector('[data-testid="box"]');
    expect(el?.tagName).toBe('DIV');
    expect(el?.textContent).toBe('hello');
  });

  it('honours the `as` prop for polymorphism', () => {
    const { container } = render(
      <Box as="section" data-testid="box">
        section
      </Box>,
    );
    const el = container.querySelector('[data-testid="box"]');
    expect(el?.tagName).toBe('SECTION');
  });

  it('merges layout props onto single child via `asChild`', () => {
    const { getByRole } = render(
      <Box asChild padding="4">
        <a href="/home">Home</a>
      </Box>,
    );
    const anchor = getByRole('link');
    expect(anchor.tagName).toBe('A');
    expect(anchor.getAttribute('href')).toBe('/home');
    expect((anchor as HTMLElement).style.getPropertyValue('--cynosure-lp-p-base')).toBe(
      'var(--cynosure-space-4)',
    );
  });

  it('forwards refs', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Box ref={ref}>x</Box>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('merges className with its own layout class', () => {
    const { container } = render(
      <Box className="custom" data-testid="box">
        x
      </Box>,
    );
    const el = container.querySelector('[data-testid="box"]') as HTMLElement;
    expect(el.className).toMatch(/custom/);
    // Box's own class is present too (vanilla-extract gives it a scoped name).
    expect(el.className.split(' ').length).toBeGreaterThanOrEqual(2);
  });

  it('emits responsive CSS variables for `padding={{ base, md }}`', () => {
    const { container } = render(
      <Box padding={{ base: '2', md: '4' }} data-testid="box">
        x
      </Box>,
    );
    const el = container.querySelector('[data-testid="box"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-lp-p-base')).toBe('var(--cynosure-space-2)');
    expect(el.style.getPropertyValue('--cynosure-lp-p-md')).toBe('var(--cynosure-space-4)');
  });

  it('resolves size aliases (`full`/`screen`/`prose`)', () => {
    const { container } = render(
      <Box width="full" height="screen" maxWidth="prose" data-testid="box">
        x
      </Box>,
    );
    const el = container.querySelector('[data-testid="box"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-lp-w-base')).toBe('100%');
    expect(el.style.getPropertyValue('--cynosure-lp-h-base')).toBe('100vh');
    expect(el.style.getPropertyValue('--cynosure-lp-maxw-base')).toBe('65ch');
  });

  it('resolves raw length values without translation', () => {
    const { container } = render(
      <Box width="240px" height="50%" data-testid="box">
        x
      </Box>,
    );
    const el = container.querySelector('[data-testid="box"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-lp-w-base')).toBe('240px');
    expect(el.style.getPropertyValue('--cynosure-lp-h-base')).toBe('50%');
  });

  it('resolves color tokens to `var(--cynosure-color-*)`', () => {
    const { container } = render(
      <Box background="bg.surface" color="fg.default" borderColor="border.focus" data-testid="box">
        x
      </Box>,
    );
    const el = container.querySelector('[data-testid="box"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-lp-bg-base')).toBe(
      'var(--cynosure-color-background-surface)',
    );
    expect(el.style.getPropertyValue('--cynosure-lp-fg-base')).toBe(
      'var(--cynosure-color-foreground-default)',
    );
    expect(el.style.getPropertyValue('--cynosure-lp-bc-base')).toBe(
      'var(--cynosure-color-border-focus)',
    );
  });

  it('resolves feedback color tokens', () => {
    const { container } = render(
      <Box background="feedback.success.soft" data-testid="box">
        ok
      </Box>,
    );
    const el = container.querySelector('[data-testid="box"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-lp-bg-base')).toBe(
      'var(--cynosure-color-feedback-success-soft)',
    );
  });

  it('preserves user-provided inline style next to layout vars', () => {
    const { container } = render(
      <Box padding="4" style={{ outline: '1px solid red' }} data-testid="box">
        x
      </Box>,
    );
    const el = container.querySelector('[data-testid="box"]') as HTMLElement;
    expect(el.style.outline).toBe('1px solid red');
    expect(el.style.getPropertyValue('--cynosure-lp-p-base')).toBe('var(--cynosure-space-4)');
  });

  it('forwards unknown intrinsic attributes to the underlying element', () => {
    const { container } = render(
      <Box as="button" type="button" disabled data-testid="box">
        click
      </Box>,
    );
    const el = container.querySelector('[data-testid="box"]') as HTMLButtonElement;
    expect(el.tagName).toBe('BUTTON');
    expect(el.type).toBe('button');
    expect(el.disabled).toBe(true);
  });
});
