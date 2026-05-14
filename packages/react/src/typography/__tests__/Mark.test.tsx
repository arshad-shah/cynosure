import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HighlightedText, Mark } from '../Mark/index.js';

describe('Mark', () => {
  it('renders a <mark> by default', () => {
    const { container } = render(<Mark>found</Mark>);
    const el = container.querySelector('mark');
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe('found');
  });

  it('renders <span> when as="span"', () => {
    const { container } = render(
      <Mark as="span" data-testid="m">
        x
      </Mark>,
    );
    const el = container.querySelector('[data-testid="m"]') as HTMLElement;
    expect(el.tagName).toBe('SPAN');
  });

  it('applies variant + colorScheme + intensity classes', () => {
    const { container } = render(
      <Mark variant="chip" colorScheme="danger" intensity="solid" data-testid="m">
        x
      </Mark>,
    );
    const el = container.querySelector('[data-testid="m"]') as HTMLElement;
    // The vanilla-extract class names embed the styleVariants key — assert
    // we got the danger key for the chipSolid map.
    expect(el.className).toMatch(/danger/);
  });

  it('forwards native title for tooltip use-case', () => {
    const { container } = render(<Mark title="match #1">x</Mark>);
    expect(container.querySelector('mark')?.getAttribute('title')).toBe('match #1');
  });

  // Cover every `variantClass` branch so the function's four return paths and
  // the inner `intensity === 'solid'` ternary all execute.
  it.each([
    ['marker', 'subtle'],
    ['marker', 'solid'],
    ['underline', 'subtle'],
    ['underline', 'solid'],
    ['chip', 'subtle'],
    ['chip', 'solid'],
    ['bold', 'subtle'],
    ['bold', 'solid'],
  ] as const)('renders variant=%s intensity=%s without throwing', (variant, intensity) => {
    const { container } = render(
      <Mark variant={variant} intensity={intensity} data-testid="m">
        x
      </Mark>,
    );
    expect(container.querySelector('[data-testid="m"]')).not.toBeNull();
  });
});

describe('HighlightedText', () => {
  it('wraps each range in a <mark>', () => {
    const { container } = render(
      <HighlightedText
        text="the quick brown fox"
        ranges={[
          { start: 0, length: 3 },
          { start: 10, length: 5 },
        ]}
      />,
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0].textContent).toBe('the');
    expect(marks[1].textContent).toBe('brown');
    // Surrounding text remains.
    expect(container.textContent).toBe('the quick brown fox');
  });

  it('accepts {start, end} form and {start, length} form', () => {
    const { container } = render(
      <HighlightedText
        text="abcdef"
        ranges={[
          { start: 1, end: 3 },
          { start: 4, length: 2 },
        ]}
      />,
    );
    const marks = Array.from(container.querySelectorAll('mark')).map((m) => m.textContent);
    expect(marks).toEqual(['bc', 'ef']);
  });

  it('merges overlapping ranges so each character is wrapped once', () => {
    const { container } = render(
      <HighlightedText
        text="abcdef"
        ranges={[
          { start: 0, length: 3 }, // abc
          { start: 2, length: 3 }, // cde — overlaps
        ]}
      />,
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('abcde');
  });

  it('clamps out-of-range indices and drops empty ranges', () => {
    const { container } = render(
      <HighlightedText
        text="abc"
        ranges={[
          { start: -5, length: 1 }, // clamps to start=0, end=1 → "a"
          { start: 2, length: 99 }, // clamps end → "c"
          { start: 1, length: 0 }, // dropped (empty)
        ]}
      />,
    );
    const marks = Array.from(container.querySelectorAll('mark')).map((m) => m.textContent);
    expect(marks).toEqual(['a', 'c']);
  });

  it('renders just the text with no <mark> when ranges is empty', () => {
    const { container } = render(<HighlightedText text="plain" ranges={[]} />);
    expect(container.querySelector('mark')).toBeNull();
    expect(container.textContent).toBe('plain');
  });

  it('forwards Mark props (variant, colorScheme, intensity, title)', () => {
    const { container } = render(
      <HighlightedText
        text="abcdef"
        ranges={[{ start: 1, length: 2 }]}
        variant="chip"
        colorScheme="success"
        intensity="solid"
        title="match"
      />,
    );
    const el = container.querySelector('mark') as HTMLElement;
    expect(el.getAttribute('title')).toBe('match');
    expect(el.className).toMatch(/success/);
  });

  it('wraps in a custom element when wrapper prop is set', () => {
    const { container } = render(
      <HighlightedText text="hi there" ranges={[{ start: 3, length: 5 }]} wrapper="p" />,
    );
    const p = container.querySelector('p');
    expect(p).not.toBeNull();
    expect(p?.querySelector('mark')?.textContent).toBe('there');
  });
});
