import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { codeBlockScroll } from './CodeBlock.css.js';
import { CodeBlock } from './CodeBlock.js';

/**
 * Real-browser layout check — `maxHeight` caps the scroll container and lets
 * its content overflow with `overflow: auto`. `scrollHeight`, `clientHeight`
 * and the `max-height` cap are all products of real layout that jsdom reports
 * as 0, so the scrollable-overflow behaviour can only be verified in a real
 * engine. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
const LONG = Array.from({ length: 40 }, (_, i) => `const value_${i} = compute(${i});`).join('\n');

test('CodeBlock caps its height and makes the source scrollable', () => {
  const { container } = render(
    <CodeBlock language="ts" maxHeight={180}>
      {LONG}
    </CodeBlock>,
  );

  const scroll = container.querySelector<HTMLElement>(`.${codeBlockScroll.split(' ')[0]}`);
  expect(scroll).not.toBeNull();
  if (!scroll) throw new Error('scroll container missing');

  // The 40-line snippet exceeds the 180px cap, so the region overflows.
  expect(scroll.clientHeight).toBeLessThanOrEqual(182);
  expect(scroll.scrollHeight).toBeGreaterThan(scroll.clientHeight);

  scroll.scrollTop = 100;
  expect(scroll.scrollTop).toBeGreaterThan(0);
});
