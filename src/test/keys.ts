/**
 * Presses a real key (a Playwright key press, by its `KeyboardEvent.key` name such as "PageDown") through the command
 * the Vitest run registers (.storybook/vitest.setup.ts). Synthetic key events, as `userEvent.keyboard` sends, never
 * start the browser's own behaviour, such as scrolling the focused element. Resolves false where nothing can press a
 * real key, as in the published Storybook: the story should then stop checking what only a real key does.
 */
export async function pressKey(key: string): Promise<boolean> {
  const command = (globalThis as { cyPressKey?: (key: string) => Promise<void> }).cyPressKey;
  if (!command) return false;
  await command(key);
  return true;
}
