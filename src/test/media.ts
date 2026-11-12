/** Media features a story can emulate; `null` puts one back to the browser's own value. */
export type EmulatedMedia = {
  reducedMotion?: "reduce" | "no-preference" | null;
  contrast?: "more" | "no-preference" | null;
};

/**
 * Emulates media features (prefers-reduced-motion, prefers-contrast) for the story's page through the Playwright
 * command the Vitest run registers (vitest.config.ts, .storybook/vitest.setup.ts). Resolves false where nothing can
 * emulate them, as in the published Storybook: stories that need it are tagged "!dev" and return early there.
 * Always put the features back (`null`) in a `finally`, since the page is shared with the next story file.
 */
export async function emulateMedia(media: EmulatedMedia): Promise<boolean> {
  const command = (globalThis as { cyEmulateMedia?: (media: EmulatedMedia) => Promise<void> }).cyEmulateMedia;
  if (!command) return false;
  await command(media);
  return true;
}
