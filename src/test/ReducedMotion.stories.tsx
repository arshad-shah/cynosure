import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { LoadingDots } from "../components/LoadingDots/LoadingDots.js";
import { emulateMedia } from "./media.js";

/**
 * Isolation under prefers-reduced-motion (src/styles/base.css): Cynosure stops its own animations and transitions,
 * and only its own. A host element whose class merely contains "cy-" (privacy-banner, legacy-box) keeps moving.
 * Tagged "!dev": the media feature is emulated through the Vitest run's Playwright command.
 */
const meta = { title: "Contracts/Reduced motion", tags: ["!dev", "serial"] } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const moving = { animationName: "host-pulse", animationDuration: "1s", transitionDuration: "1s" };

export const OnlyCynosureStops: Story = {
  render: () => (
    <div>
      <div className="privacy-banner" data-testid="banner" style={moving}>
        Host banner
      </div>
      <div className="legacy-box fancy-cy-card" data-testid="legacy" style={moving}>
        Host box
      </div>
      <LoadingDots label="Loading" data-testid="dots" style={moving} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const get = (id: string) => canvasElement.querySelector(`[data-testid="${id}"]`) as HTMLElement;
    const dots = get("dots");
    const dot = dots.querySelector(".cy-loading-dots-dot") as HTMLElement;
    // Without the preference, everything keeps its own timing.
    await expect(getComputedStyle(dots).animationDuration).toBe("1s");
    if (!(await emulateMedia({ reducedMotion: "reduce" }))) return;
    try {
      await waitFor(() => expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true));
      // Cynosure's elements, their parts and their pseudo-elements stop.
      await expect(getComputedStyle(dots).animationDuration).toBe("0s");
      await expect(getComputedStyle(dots).transitionDuration).toBe("0s");
      await expect(getComputedStyle(dot).animationDuration).toBe("0s");
      await expect(getComputedStyle(dots, "::before").animationDuration).toBe("0s");
      // Host elements whose class happens to contain "cy-" keep their animation and transition.
      for (const id of ["banner", "legacy"]) {
        await expect(getComputedStyle(get(id)).animationDuration, `${id} animation`).toBe("1s");
        await expect(getComputedStyle(get(id)).transitionDuration).toBe("1s");
      }
    } finally {
      await emulateMedia({ reducedMotion: null });
    }
  },
};
