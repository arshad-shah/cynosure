import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section } from '../Section/index.js';

describe('Section', () => {
  it('renders a <section> by default', () => {
    const { container } = render(<Section data-testid="s">x</Section>);
    const el = container.querySelector('[data-testid="s"]') as HTMLElement;
    expect(el.tagName).toBe('SECTION');
  });

  it('honours `as="main"`', () => {
    const { container } = render(
      <Section as="main" data-testid="s">
        x
      </Section>,
    );
    const el = container.querySelector('[data-testid="s"]') as HTMLElement;
    expect(el.tagName).toBe('MAIN');
  });

  it('applies the `space` variant class', () => {
    const { container } = render(
      <Section space="lg" data-testid="s">
        x
      </Section>,
    );
    const el = container.querySelector('[data-testid="s"]') as HTMLElement;
    expect(el.className).toMatch(/sectionSpace/);
  });
});
