import { expect, waitFor } from "storybook/test";

/** Waits until every animation and transition on `el` and inside it has finished (a busy CI runner can be slow). */
export async function settled(el: Element) {
  await waitFor(
    async () => {
      await Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => undefined)));
      expect(el.getAnimations({ subtree: true }).filter((a) => a.playState === "running")).toHaveLength(0);
    },
    { timeout: 3000 },
  );
}

/** An opened overlay really shows: once its entrance has finished it is fully opaque (not just open). */
export async function shownFully(el: Element) {
  await settled(el);
  await expect(getComputedStyle(el).opacity).toBe("1");
}
