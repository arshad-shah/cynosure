type Mover = (el: Element, over: boolean) => Promise<void>;

/**
 * Moves the real pointer over `el` (or, with `over` false, off it) through the provider the Vitest run registers
 * (.storybook/vitest.setup.ts), so CSS `:hover` applies; Testing Library's `userEvent.hover` only dispatches events.
 * Resolves false where nothing can move the pointer, as in the published Storybook: stories that need it are tagged
 * "!dev".
 */
export async function realHover(el: Element, over = true): Promise<boolean> {
  const move = (globalThis as { cyHover?: Mover }).cyHover;
  if (!move) return false;
  await move(el, over);
  return true;
}
