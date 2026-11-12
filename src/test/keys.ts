/**
 * Presses a real key (a Playwright key press, by its `KeyboardEvent.key` name such as "PageDown") through the command
 * the Vitest run registers (.storybook/vitest.setup.ts). Synthetic key events, as `userEvent.keyboard` sends, never
 * start the browser's own behaviour, such as scrolling the focused element. Resolves false where nothing can press a
 * real key, as in the published Storybook: the story should then stop checking what only a real key does. Another
 * test file can take focus between the press and its effect, so press again inside the check (`waitFor`) when a repeat
 * is harmless.
 */
export async function pressKey(key: string): Promise<boolean> {
  const command = (globalThis as { cyPressKey?: (key: string) => Promise<void> }).cyPressKey;
  if (!command) return false;
  // Test files run in iframes of one page, and a file starting in parallel focuses its own frame: a real key goes to
  // whichever frame has focus, so take it back first. Stories should still retry a press until its effect shows.
  window.focus();
  await command(key);
  return true;
}
