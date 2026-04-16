import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Text } from '../Text/index.js';

describe('Text', () => {
  it('renders a <span> by default', () => {
    const { container } = render(<Text data-testid="t">hi</Text>);
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.tagName).toBe('SPAN');
    expect(el.textContent).toBe('hi');
  });

  it('honours the `as` prop', () => {
    const { container } = render(
      <Text as="p" data-testid="t">
        paragraph
      </Text>,
    );
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.tagName).toBe('P');
  });

  it('maps `size` to the body composite token custom properties', () => {
    const { container } = render(
      <Text size="lg" data-testid="t">
        big
      </Text>,
    );
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.style.getPropertyValue('--lumen-text-size-base')).toBe(
      'var(--lumen-font-body-lg-size)',
    );
    expect(el.style.getPropertyValue('--lumen-text-lh-base')).toBe(
      'var(--lumen-font-body-lg-line-height)',
    );
  });

  it('emits responsive font-size variables', () => {
    const { container } = render(
      <Text size={{ base: 'sm', md: 'lg' }} data-testid="t">
        resp
      </Text>,
    );
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.style.getPropertyValue('--lumen-text-size-base')).toBe(
      'var(--lumen-font-body-sm-size)',
    );
    expect(el.style.getPropertyValue('--lumen-text-size-md')).toBe(
      'var(--lumen-font-body-lg-size)',
    );
  });

  it('maps `weight` to the weight custom property', () => {
    const { container } = render(
      <Text weight="bold" data-testid="t">
        x
      </Text>,
    );
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.style.getPropertyValue('--lumen-text-weight-base')).toBe(
      'var(--lumen-font-weight-bold)',
    );
  });

  it('applies truncate={true} via the single-line class', () => {
    const { container } = render(
      <Text truncate data-testid="t">
        a long string that would overflow
      </Text>,
    );
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.className).toMatch(/truncateOne/);
  });

  it('applies truncate={n>1} via the line-clamp class and sets --line-clamp', () => {
    const { container } = render(
      <Text truncate={3} data-testid="t">
        x
      </Text>,
    );
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.className).toMatch(/lineClamp/);
    expect(el.style.getPropertyValue('--lumen-typography-line-clamp')).toBe('3');
  });

  it('resolves decoration color to a CSS var', () => {
    const { container } = render(
      <Text underline decorationColor="accent.solid" data-testid="t">
        x
      </Text>,
    );
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.style.getPropertyValue('--lumen-typography-decoration-color')).toBe(
      'var(--lumen-color-accent-solid)',
    );
  });

  it('forwards LayoutProps like `color` onto the layout custom props', () => {
    const { container } = render(
      <Text color="fg.muted" data-testid="t">
        muted
      </Text>,
    );
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.style.getPropertyValue('--lumen-lp-fg-base')).toBe(
      'var(--lumen-color-foreground-muted)',
    );
  });

  it('asChild projects Text onto its child element', () => {
    const { getByRole } = render(
      <Text asChild size="sm">
        <a href="/docs">docs</a>
      </Text>,
    );
    const a = getByRole('link') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/docs');
    expect(a.style.getPropertyValue('--lumen-text-size-base')).toBe(
      'var(--lumen-font-body-sm-size)',
    );
  });

  it('merges italic + underline + strikethrough decoration classes', () => {
    const { container } = render(
      <Text italic underline strikethrough data-testid="t">
        x
      </Text>,
    );
    const el = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(el.className).toMatch(/italic/);
    // combined class covers both decorations
    expect(el.className).toMatch(/underlineAndStrikethrough|underline/);
  });
});
