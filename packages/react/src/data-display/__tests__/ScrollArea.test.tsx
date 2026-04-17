import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScrollArea } from '../ScrollArea/index.js';

describe('ScrollArea', () => {
  it('renders children and applies explicit dimensions', () => {
    const { container, getByText } = render(
      <ScrollArea height={200} width="100%">
        <p>content</p>
      </ScrollArea>,
    );
    expect(getByText('content')).toBeInTheDocument();
    const root = container.firstChild as HTMLElement;
    expect(root.style.height).toBe('200px');
    expect(root.style.width).toBe('100%');
  });
});
