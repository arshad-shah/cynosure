import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Center } from '../Center/index.js';

describe('Center', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Center>
        <span>hello</span>
      </Center>,
    );
    expect(getByText('hello')).toBeInTheDocument();
  });

  it('accepts layout props like minHeight', () => {
    const { container } = render(
      <Center minHeight="screen" data-testid="center">
        <span>x</span>
      </Center>,
    );
    const el = container.querySelector('[data-testid="center"]') as HTMLElement;
    expect(el.style.getPropertyValue('--cynosure-lp-minh-base')).toBe('100vh');
  });
});
