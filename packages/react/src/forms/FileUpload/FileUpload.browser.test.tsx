import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { FileUpload } from './FileUpload.js';

/**
 * The default drop zone is a large dashed surface whose real rendered area is
 * the primary drag-and-drop affordance. jsdom zeroes `getBoundingClientRect`,
 * so the real dimensions can only be verified in a real browser
 * (Chromium/Firefox/WebKit). We also exercise the native file-input pipeline.
 */
test('FileUpload drop zone has real rendered dimensions and backs a hidden file input', async () => {
  const { container } = render(
    <div style={{ width: 420 }}>
      <FileUpload multiple accept="image/*,application/pdf" />
    </div>,
  );

  const dropZone = screen.getByRole('button');
  await expect.poll(() => dropZone.getBoundingClientRect().height).toBeGreaterThan(0);

  const rect = dropZone.getBoundingClientRect();
  expect(rect.width).toBeGreaterThan(0);
  expect(rect.height).toBeGreaterThan(0);

  // The hidden native input is wired to the drop zone via aria-controls.
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  expect(input).not.toBeNull();
  expect(dropZone.getAttribute('aria-controls')).toBe((input as HTMLInputElement).id);
});

test('FileUpload surfaces a chosen file in the list in a real browser', async () => {
  const { container } = render(<FileUpload multiple />);
  const input = container.querySelector<HTMLInputElement>('input[type="file"]') as HTMLInputElement;

  const file = new File(['hello'], 'doc.txt', { type: 'text/plain' });
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  fireEvent.change(input);

  await waitFor(() => expect(screen.getByText('doc.txt')).toBeInTheDocument());
});
