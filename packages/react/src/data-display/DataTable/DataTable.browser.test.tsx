import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { dataTableScroll } from './DataTable.css.js';
import { DataTable } from './DataTable.js';
import type { ColumnDef } from './DataTable.js';

/**
 * Real-browser layout check — `stickyHeader` pins the `<thead>` with
 * `position: sticky; top: 0` inside the scroll container. jsdom does not
 * implement sticky positioning or scrolling layout, so the header staying
 * pinned to the container's top edge while the body scrolls can only be
 * verified with a real engine. Runs across the Chromium/Firefox/WebKit matrix
 * in CI.
 */
interface Row {
  id: string;
  name: string;
}
const DATA: Row[] = Array.from({ length: 40 }, (_, i) => ({
  id: String(i),
  name: `Row ${i}`,
}));
const COLUMNS: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }];

test('DataTable keeps the header pinned to the top while the body scrolls', async () => {
  const { container } = render(
    <div style={{ height: 200 }}>
      <DataTable<Row> data={DATA} columns={COLUMNS} stickyHeader />
    </div>,
  );

  const scroller = container.querySelector<HTMLElement>(`.${dataTableScroll.split(' ')[0]}`);
  expect(scroller).not.toBeNull();
  if (!scroller) throw new Error('scroll container missing');

  const thead = container.querySelector('thead');
  if (!thead) throw new Error('thead missing');

  const beforeTop = thead.getBoundingClientRect().top;
  scroller.scrollTop = 400;
  // Sticky positioning keeps the header at the scroller's top edge.
  await Promise.resolve();
  const scrollerTop = scroller.getBoundingClientRect().top;
  const afterTop = thead.getBoundingClientRect().top;

  expect(scroller.scrollTop).toBeGreaterThan(0);
  expect(Math.abs(afterTop - scrollerTop)).toBeLessThanOrEqual(2);
  // The header did not scroll out of view with the body.
  expect(Math.abs(afterTop - beforeTop)).toBeLessThanOrEqual(2);
});
