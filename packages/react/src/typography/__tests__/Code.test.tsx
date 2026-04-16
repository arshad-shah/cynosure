import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Code } from '../Code/index.js';

describe('Code', () => {
  it('renders inline as <code> by default', () => {
    const { container } = render(<Code>pnpm install</Code>);
    const el = container.querySelector('code');
    expect(el?.textContent).toBe('pnpm install');
  });

  it('block variant wraps <code> inside <pre>', () => {
    const { container } = render(<Code variant="block">line1\nline2</Code>);
    const pre = container.querySelector('pre');
    const code = pre?.querySelector('code');
    expect(pre).not.toBeNull();
    expect(code?.textContent).toContain('line1');
  });

  it('applies colorScheme variant class', () => {
    const { container } = render(
      <Code colorScheme="accent" data-testid="c">
        x
      </Code>,
    );
    const el = container.querySelector('[data-testid="c"]') as HTMLElement;
    expect(el.className).toMatch(/accent/);
  });
});
