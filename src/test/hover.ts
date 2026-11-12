/**
 * Moves the real pointer over an element, so CSS `:hover` applies (testing-library's `userEvent.hover` only dispatches
 * events, which never match `:hover`). Uses the Playwright hover the Vitest run registers (.storybook/vitest.setup.ts);
 * resolves false where there is none, as in the published Storybook: stories that need it are tagged "!dev" and return
 * early there. `null` moves the pointer to the top-left corner of the page, off every story element.
 */
export async function realHover(el: Element | null): Promise<boolean> {
  const command = (globalThis as { cyRealHover?: (el: Element | null) => Promise<void> }).cyRealHover;
  if (!command) return false;
  await command(el);
  return true;
}
