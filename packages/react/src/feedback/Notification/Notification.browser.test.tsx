import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactElement, useState } from 'react';
import { expect, test } from 'vitest';
import { Notification } from './Notification.js';

/**
 * Real-browser test: Notification is mostly a visual surface, but the dismiss
 * affordance is a real focusable button rendered over the card. We verify the
 * close control has an accessible name, a measurable hit target, and that
 * activating it removes the node from the document. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
function Dismissable(): ReactElement {
  const [open, setOpen] = useState(true);
  return open ? (
    <Notification
      title="Deployment succeeded"
      description="main → production."
      onDismiss={() => setOpen(false)}
    />
  ) : (
    <p>Dismissed</p>
  );
}

test('Notification dismiss button removes the notification', async () => {
  render(<Dismissable />);
  expect(screen.getByText('Deployment succeeded')).toBeInTheDocument();

  const close = screen.getByRole('button', { name: 'Dismiss notification' });
  expect(close.getBoundingClientRect().width).toBeGreaterThan(0);

  fireEvent.click(close);
  await waitFor(() => {
    expect(screen.queryByText('Deployment succeeded')).not.toBeInTheDocument();
  });
  expect(screen.getByText('Dismissed')).toBeInTheDocument();
});
