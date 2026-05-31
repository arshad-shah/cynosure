import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { expect, test } from 'vitest';
import { Pagination } from './Pagination.js';

/**
 * Real-browser focus-management check — browsers refuse to move focus to a
 * `disabled` button and apply their own click-focus rules, behaviours jsdom
 * fakes. This verifies that the Previous control is unfocusable at the first
 * page and becomes focusable once navigation moves off the boundary. Runs
 * across the Chromium/Firefox/WebKit matrix in CI.
 */
function Harness(): ReactNode {
  const [page, setPage] = useState(1);
  return <Pagination totalPages={5} currentPage={page} onPageChange={setPage} />;
}

test('Pagination keeps focus off the disabled Previous button at the boundary', () => {
  render(<Harness />);

  const prev = screen.getByRole('button', { name: 'Previous page' });
  // At page 1 the Previous control is disabled — a real browser will not focus it.
  expect(prev).toBeDisabled();
  prev.focus();
  expect(document.activeElement).not.toBe(prev);

  // Advance to page 3; Previous is now enabled and focusable.
  fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
  const prevAfter = screen.getByRole('button', { name: 'Previous page' });
  expect(prevAfter).not.toBeDisabled();
  prevAfter.focus();
  expect(document.activeElement).toBe(prevAfter);
});
