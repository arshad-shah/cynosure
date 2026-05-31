import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from './Breadcrumb.js';

/**
 * Real-browser focus-management check — sequential Tab traversal and the
 * resulting `document.activeElement` follow the browser's real focus model,
 * which jsdom only approximates. This confirms the auto-interleaved separators
 * (rendered as aria-hidden `<li>`s) are skipped and only the navigable links
 * land in the tab order. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Breadcrumb tab order visits links and skips separators', async () => {
  render(
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/library">Library</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>
        <BreadcrumbPage>Data</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>,
  );

  const home = screen.getByRole('link', { name: 'Home' });
  const library = screen.getByRole('link', { name: 'Library' });

  await userEvent.tab();
  expect(document.activeElement).toBe(home);
  await userEvent.tab();
  // Separators are aria-hidden and non-focusable, so focus jumps straight to
  // the next link rather than landing on a separator.
  expect(document.activeElement).toBe(library);
  await userEvent.tab();
  // The current page is a plain span — not focusable — so focus leaves the nav.
  expect(document.activeElement).not.toBe(screen.getByText('Data'));
});
