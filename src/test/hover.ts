import { bridge } from "./bridge.js";

/**
 * Moves the real pointer over `el` (or, with `over` false, off it) through the provider the Vitest run registers
 * (.storybook/vitest.setup.ts), so CSS `:hover` applies; Testing Library's `userEvent.hover` only dispatches events.
 * `null` moves the pointer to the top-left corner of the page, off every story element. Resolves false where nothing
 * can move the pointer, as in the published Storybook: stories that need it are tagged "!dev".
 */
export async function realHover(el: Element | null, over = true): Promise<boolean> {
  const move = bridge("cyHover");
  if (!move) return false;
  await move(el, over);
  return true;
}
