import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Textarea } from './Textarea.js';

/**
 * `autoResize` grows the field to fit its content. The non-Chromium fallback
 * reads `el.scrollHeight` and writes it back to `el.style.height` on every
 * `input` — neither `scrollHeight` nor the resulting box height is meaningful
 * in jsdom (it zeroes layout). This runs in a real browser
 * (Chromium/Firefox/WebKit) where the field can actually measure and grow.
 */
test('Textarea autoResize grows the field height as lines are added', async () => {
  render(<Textarea aria-label="Notes" autoResize maxRows={10} rows={2} />);
  const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Notes' });

  await expect.poll(() => textarea.getBoundingClientRect().height).toBeGreaterThan(0);
  const initialHeight = textarea.getBoundingClientRect().height;

  fireEvent.change(textarea, {
    target: { value: 'line one\nline two\nline three\nline four\nline five' },
  });

  await waitFor(() => {
    expect(textarea.getBoundingClientRect().height).toBeGreaterThan(initialHeight);
  });
});

test('Textarea reflects typed values in a real browser', async () => {
  render(<Textarea aria-label="Bio" rows={3} />);
  const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Bio' });

  fireEvent.change(textarea, { target: { value: 'about me' } });
  await waitFor(() => expect(textarea.value).toBe('about me'));
});
