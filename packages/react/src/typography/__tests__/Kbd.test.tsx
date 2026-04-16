import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Kbd } from '../Kbd/index.js';

describe('Kbd', () => {
  it('renders a <kbd>', () => {
    const { container } = render(<Kbd>⌘K</Kbd>);
    const el = container.querySelector('kbd');
    expect(el?.textContent).toBe('⌘K');
  });

  it('applies size class', () => {
    const { container } = render(
      <Kbd size="lg" data-testid="k">
        Enter
      </Kbd>,
    );
    const el = container.querySelector('[data-testid="k"]') as HTMLElement;
    expect(el.className).toMatch(/lg/);
  });
});
