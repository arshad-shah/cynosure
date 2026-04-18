import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading } from '../Heading/index.js';
import { Text } from '../Text/index.js';

describe('typography composition', () => {
  it('Text asChild inside Heading resolves to a single styled element', () => {
    const { container } = render(
      <Heading level={1} data-testid="h">
        <Text asChild weight="regular" data-testid="t">
          <span>hi</span>
        </Text>
      </Heading>,
    );
    const h = container.querySelector('[data-testid="h"]') as HTMLElement;
    expect(h.tagName).toBe('H1');
    const t = container.querySelector('[data-testid="t"]') as HTMLElement;
    expect(t.tagName).toBe('SPAN');
    // Text's weight prop flows through Slot's ref/style merging
    expect(t.style.getPropertyValue('--cynosure-text-weight-base')).toBe(
      'var(--cynosure-font-weight-regular)',
    );
  });
});
