import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimpleGrid } from '../SimpleGrid/index.js';
import { Wrap } from '../Wrap/index.js';

// These tests exercise the render paths. Layout primitives write values into
// CSS custom properties, which jsdom surfaces through `getAttribute('style')`
// but not always through the typed `style.*` shorthand — so we assert against
// the serialised inline-style string.

const styleOf = (node: Element | null): string => node?.getAttribute('style') ?? '';

describe('SimpleGrid', () => {
  it('renders children with a fixed column count', () => {
    const { container } = render(
      <SimpleGrid columns={3} gap="2">
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </SimpleGrid>,
    );
    expect(styleOf(container.firstElementChild)).toMatch(/repeat\(3, minmax\(0, 1fr\)\)/);
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('prefers minChildWidth when both props are given', () => {
    const { container } = render(
      <SimpleGrid columns={2} minChildWidth="12rem">
        <span>a</span>
      </SimpleGrid>,
    );
    expect(styleOf(container.firstElementChild)).toMatch(/auto-fit, minmax\(12rem, 1fr\)/);
  });

  it('accepts split column / row gap props', () => {
    const { container } = render(
      <SimpleGrid columns={2} columnGap="2" rowGap="4">
        <span>a</span>
      </SimpleGrid>,
    );
    expect(container.firstElementChild).not.toBeNull();
  });

  it('supports asChild (slot)', () => {
    const { container } = render(
      <SimpleGrid asChild columns={2}>
        <section data-testid="slot" />
      </SimpleGrid>,
    );
    expect(container.querySelector('section')).not.toBeNull();
    expect(screen.getByTestId('slot')).toBeInTheDocument();
  });

  it('supports the `as` prop to change the root element', () => {
    render(
      <SimpleGrid as="ul" columns={2} data-testid="ul">
        <li>x</li>
      </SimpleGrid>,
    );
    expect(screen.getByTestId('ul').tagName).toBe('UL');
  });
});

describe('Wrap', () => {
  it('renders all children', () => {
    render(
      <Wrap gap="2">
        <span>one</span>
        <span>two</span>
        <span>three</span>
      </Wrap>,
    );
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();
  });

  it('writes align + justify tokens into CSS custom properties', () => {
    const { container } = render(
      <Wrap gap="1" align="center" justify="between">
        <span>x</span>
      </Wrap>,
    );
    const style = styleOf(container.firstElementChild);
    // Responsive-aware primitives write `*-base` slots for the base breakpoint.
    expect(style).toContain('--cynosure-inline-align-base: center');
    expect(style).toContain('--cynosure-inline-justify-base: space-between');
  });

  it('writes split row / column gap tokens', () => {
    const { container } = render(
      <Wrap rowGap="2" columnGap="4">
        <span>x</span>
      </Wrap>,
    );
    const style = styleOf(container.firstElementChild);
    expect(style).toContain('--cynosure-inline-row-gap');
    expect(style).toContain('--cynosure-inline-col-gap');
  });

  it('supports asChild (slot)', () => {
    render(
      <Wrap asChild>
        <ul data-testid="wrap-ul" />
      </Wrap>,
    );
    expect(screen.getByTestId('wrap-ul').tagName).toBe('UL');
  });

  it('accepts a responsive align prop', () => {
    const { container } = render(
      <Wrap align={{ base: 'start', md: 'center' }}>
        <span>x</span>
      </Wrap>,
    );
    expect(container.firstElementChild).not.toBeNull();
  });
});
