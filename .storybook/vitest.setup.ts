import * as a11y from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { expect } from "vitest";
import { page } from "vitest/browser";
import * as project from "./preview";

/** Visual regression, Vitest-only: stories tagged "visual" are screenshotted when VITE_CY_VISUAL=1 (CI, Linux baselines). */
const visual = import.meta.env.VITE_CY_VISUAL === "1";

setProjectAnnotations([
  a11y,
  project,
  {
    // Firefox: element.focus() inside a test iframe does not make that frame the focused frame once a previous
    // test's frame (which held focus) is gone, so keystrokes go elsewhere. Focus this frame before every story.
    beforeEach: () => {
      window.focus();
    },
    afterEach: async ({ tags, canvasElement, id }) => {
      if (!visual || !tags.includes("visual")) return;
      await expect.element(page.elementLocator(canvasElement)).toMatchScreenshot(id);
      // Dark mode: flip the decorator's theme wrapper (light-dark() tokens follow color-scheme), then restore.
      const theme = canvasElement.querySelector(".cy-theme");
      if (!theme) return;
      // Then dark with more contrast (the contrast global's override block), the combination most likely to regress.
      const previous = {
        mode: theme.getAttribute("data-cy-mode"),
        contrast: theme.getAttribute("data-cy-contrast"),
      };
      const restore = (attr: string, value: string | null) =>
        value === null ? theme.removeAttribute(attr) : theme.setAttribute(attr, value);
      theme.setAttribute("data-cy-mode", "dark");
      await new Promise((r) => setTimeout(r, 400));
      await expect.element(page.elementLocator(canvasElement)).toMatchScreenshot(`${id}-dark`);
      theme.setAttribute("data-cy-contrast", "more");
      await new Promise((r) => setTimeout(r, 400));
      await expect.element(page.elementLocator(canvasElement)).toMatchScreenshot(`${id}-dark-contrast`);
      restore("data-cy-mode", previous.mode);
      restore("data-cy-contrast", previous.contrast);
    },
  },
]);
