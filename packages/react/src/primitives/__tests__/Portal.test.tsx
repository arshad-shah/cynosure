import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Portal } from '../Portal.js';

describe('Portal', () => {
  it('renders children into document.body by default', () => {
    const { getByTestId, unmount } = render(
      <Portal>
        <span data-testid="portaled">hi</span>
      </Portal>,
    );
    const el = getByTestId('portaled');
    expect(el.parentElement).toBe(document.body);
    unmount();
  });

  it('respects a custom container', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const { getByTestId, unmount } = render(
      <Portal container={target}>
        <span data-testid="portaled">hi</span>
      </Portal>,
    );
    expect(getByTestId('portaled').parentElement).toBe(target);
    unmount();
    document.body.removeChild(target);
  });

  it('accepts a container getter', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const { getByTestId, unmount } = render(
      <Portal container={() => target}>
        <span data-testid="portaled">hi</span>
      </Portal>,
    );
    expect(getByTestId('portaled').parentElement).toBe(target);
    unmount();
    document.body.removeChild(target);
  });

  it('renders inline when disabled', () => {
    const { getByTestId, container } = render(
      <Portal disabled>
        <span data-testid="portaled">hi</span>
      </Portal>,
    );
    expect(container.contains(getByTestId('portaled'))).toBe(true);
  });
});
