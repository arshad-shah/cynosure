import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Blockquote } from '../Blockquote/index.js';

describe('Blockquote', () => {
  it('renders a <blockquote>', () => {
    const { container } = render(<Blockquote>quote</Blockquote>);
    const el = container.querySelector('blockquote');
    expect(el?.textContent).toBe('quote');
  });

  it('renders attribution inside a <cite> when provided', () => {
    const { container } = render(
      <Blockquote attribution="Anon">Nothing new under the sun.</Blockquote>,
    );
    const cite = container.querySelector('cite');
    expect(cite?.textContent).toBe('Anon');
  });

  it('applies the callout variant class', () => {
    const { container } = render(
      <Blockquote variant="callout" data-testid="b">
        x
      </Blockquote>,
    );
    const el = container.querySelector('[data-testid="b"]') as HTMLElement;
    expect(el.className).toMatch(/callout/);
  });
});
