import type { EmulatedMedia } from "./media.js";

/**
 * What the Vitest run's setup file (.storybook/vitest.setup.ts) puts on `globalThis` for stories to act on the whole
 * page with: the real pointer (`realHover`), real keys (`pressKey`) and emulated media features (`emulateMedia`). None
 * is there in the published Storybook, where the helpers resolve false.
 */
export interface Bridge {
  cyHover: (el: Element | null, over: boolean) => Promise<void>;
  cyPressKey: (key: string) => Promise<void>;
  cyEmulateMedia: (media: EmulatedMedia) => Promise<void>;
}

declare global {
  var cyHover: Bridge["cyHover"] | undefined;
  var cyPressKey: Bridge["cyPressKey"] | undefined;
  var cyEmulateMedia: Bridge["cyEmulateMedia"] | undefined;
}

/** The setup file's function of that name, or undefined where the run registers none (the published Storybook). */
export const bridge = <K extends keyof Bridge>(name: K): Bridge[K] | undefined =>
  globalThis[name] as Bridge[K] | undefined;
