import * as a11y from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { expect } from "vitest";
import { page } from "vitest/browser";
import * as project from "./preview";

/** Visual regression, Vitest-only: stories tagged "visual" are screenshotted when VITE_CY_VISUAL=1 (CI, Linux baselines). */
const visual = import.meta.env.VITE_CY_VISUAL === "1";

/*
 * The theme's monospace stack (ui-monospace, SF Mono, Menlo, Consolas, monospace) names no font a Linux runner has, so
 * each run's fontconfig picked among the installed monospace faces, and medium and bold mono text (Kbd, Badge) drew
 * differently from run to run. Screenshot runs name one font that Chromium's own system packages always install, in CI
 * and in the baselines workflow alike. Visual runs only: other tests and the published Storybook keep the theme's stack.
 */
if (visual) {
  const fonts = document.createElement("style");
  fonts.textContent = ':root, .cy-theme { --cy-font-mono: "Liberation Mono", monospace !important; }';
  document.head.append(fonts);
}

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
