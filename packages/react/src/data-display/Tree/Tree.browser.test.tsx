import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Tree, type TreeNode } from './Tree.js';

/**
 * Real-browser layout check — each row is indented by
 * `padding-inline-start: calc(depth * 1rem)`, so the rendered left edge of a
 * nested item depends on the real resolution of `calc()`/`rem` and box layout.
 * jsdom resolves neither, so the increasing indentation per depth can only be
 * verified with a real engine. Runs across the Chromium/Firefox/WebKit matrix
 * in CI.
 */
const TREE: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'src/components',
        label: 'components',
        children: [{ id: 'src/components/Button.tsx', label: 'Button.tsx' }],
      },
    ],
  },
];

test('Tree indents each nesting level further than its parent', () => {
  render(<Tree items={TREE} defaultExpandedIds={['src', 'src/components']} aria-label="Files" />);

  const rowLeft = (label: string): number => {
    const row = screen.getByText(label).closest('[data-slot="row"]') as HTMLElement;
    // Content offset = box left + the inline-start padding that drives indentation.
    const rect = row.getBoundingClientRect();
    const padStart = Number.parseFloat(getComputedStyle(row).paddingInlineStart);
    return rect.left + padStart;
  };

  const depth0 = rowLeft('src');
  const depth1 = rowLeft('components');
  const depth2 = rowLeft('Button.tsx');

  // Each deeper level starts roughly 1rem (16px) further in.
  expect(depth1).toBeGreaterThan(depth0);
  expect(depth2).toBeGreaterThan(depth1);
  expect(Math.abs(depth1 - depth0 - 16)).toBeLessThanOrEqual(2);
  expect(Math.abs(depth2 - depth1 - 16)).toBeLessThanOrEqual(2);
});
