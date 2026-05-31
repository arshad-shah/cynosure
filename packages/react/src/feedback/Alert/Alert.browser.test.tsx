import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactElement, useState } from 'react';
import { expect, test } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from './Alert.js';

/**
 * Real-browser test: Alert is largely a semantic surface, but the close
 * affordance is a real focusable button rendered into the alert's layout. We
 * confirm the live-region role is applied, the dismiss control has an
 * accessible name + measurable box, and activating it removes the alert.
 * Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
function Dismissable(): ReactElement {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert status="warning" closable onClose={() => setOpen(false)}>
      <AlertTitle>Session expiring</AlertTitle>
      <AlertDescription>Save your work.</AlertDescription>
    </Alert>
  ) : (
    <p>Dismissed</p>
  );
}

test('Alert exposes its role and its dismiss button removes it', async () => {
  render(<Dismissable />);

  // Warning/danger statuses interrupt via role="alert".
  const alert = screen.getByRole('alert');
  expect(alert).toHaveAttribute('data-status', 'warning');
  expect(alert.getBoundingClientRect().height).toBeGreaterThan(0);

  const close = screen.getByRole('button', { name: 'Dismiss' });
  expect(close.getBoundingClientRect().width).toBeGreaterThan(0);

  fireEvent.click(close);
  await waitFor(() => {
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  expect(screen.getByText('Dismissed')).toBeInTheDocument();
});
