import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table.js';

/**
 * Real-browser layout check — `stickyHeader` pins the `<thead>` with
 * `position: sticky; top: 0`. jsdom implements neither sticky positioning nor
 * scrolling layout, so the header staying glued to the scroll container's top
 * edge while the body scrolls can only be verified with a real engine. Runs
 * across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Table keeps a sticky header pinned while the body scrolls', () => {
  const { container } = render(
    <div data-testid="scroller" style={{ maxHeight: 160, overflow: 'auto' }}>
      <Table variant="striped" stickyHeader>
        <TableHead>
          <TableRow>
            <TableHeader>Invoice</TableHeader>
            <TableHeader>Customer</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 40 }, (_, i) => i).map((i) => (
            <TableRow key={`row-${i.toString()}`}>
              <TableCell>{`INV-${i.toString()}`}</TableCell>
              <TableCell>{`Customer ${i.toString()}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>,
  );

  const scroller = container.querySelector<HTMLElement>('[data-testid="scroller"]');
  if (!scroller) throw new Error('scroller missing');
  const thead = container.querySelector('thead');
  if (!thead) throw new Error('thead missing');

  expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);

  scroller.scrollTop = 400;
  const scrollerTop = scroller.getBoundingClientRect().top;
  const headerTop = thead.getBoundingClientRect().top;
  // The header tracks the scroll container's top rather than scrolling away.
  expect(Math.abs(headerTop - scrollerTop)).toBeLessThanOrEqual(2);
});
