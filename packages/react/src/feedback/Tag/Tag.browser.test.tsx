import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactElement, useState } from 'react';
import { expect, test } from 'vitest';
import { Tag } from './Tag.js';

/**
 * Real-browser test: a removable Tag is a focusable inline `role="group"` that
 * also responds to Backspace/Delete, with a × button laid out beside the
 * label. Confirming the group is focusable, renders a real box, and that both
 * the click and keyboard paths remove the node needs a real layout/focus
 * engine. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
function Demo(): ReactElement {
  const [tags, setTags] = useState(['react', 'typescript']);
  const remove = (t: string): void => setTags((xs) => xs.filter((x) => x !== t));
  return (
    <>
      {tags.map((t) => (
        <Tag key={t} colorScheme="accent" onRemove={() => remove(t)}>
          {t}
        </Tag>
      ))}
    </>
  );
}

test('Tag removes via its × button and via keyboard', async () => {
  render(<Demo />);

  const reactTag = screen.getByRole('group', { name: 'react' });
  expect(reactTag.getBoundingClientRect().width).toBeGreaterThan(0);

  // Click the × removes the first tag.
  fireEvent.click(screen.getByRole('button', { name: 'Remove react' }));
  await waitFor(() => {
    expect(screen.queryByRole('group', { name: 'react' })).not.toBeInTheDocument();
  });

  // Keyboard: focus the remaining tag and press Backspace.
  const tsTag = screen.getByRole('group', { name: 'typescript' });
  tsTag.focus();
  expect(tsTag).toHaveFocus();
  fireEvent.keyDown(tsTag, { key: 'Backspace' });
  await waitFor(() => {
    expect(screen.queryByRole('group', { name: 'typescript' })).not.toBeInTheDocument();
  });
});
