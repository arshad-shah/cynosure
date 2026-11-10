import type { Decorator, Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import "../src/styles/base.css";
import { hostileHostCss } from "../src/test/hostile";
import { CynosureTheme } from "../src/theme";
import { createTheme, type Scale } from "../src/tokens";
import { reloadOnStaleDeploy } from "./stale-deploy";

reloadOnStaleDeploy();

// Source CSS (HMR in dev). Default tokens come from the generated stylesheet (pnpm css).
import.meta.glob(["../src/foundations/**/*.css", "../src/components/**/*.css", "../src/theme/*.css"], {
  eager: true,
});

import "../dist/styles/tokens.css";

export const ACCENTS: Record<string, string | undefined> = {
  Default: undefined,
  Aperture: "#e8462e",
  Prism: "#d0612a",
  Planr: "#d4a843",
  Stepframe: "#4f7bd9",
  Nimaz: "#14b8a6",
};

function HostileHost() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = hostileHostCss;
    document.head.append(style);
    return () => style.remove();
  }, []);
  return null;
}

const withCynosure: Decorator = (Story, { globals, viewMode }) => {
  const accent = ACCENTS[globals.accent as string];
  const theme = createTheme({
    ...(accent ? { accent } : {}),
    scale: (globals.scale as Scale) ?? "comfortable",
  });
  return (
    <CynosureTheme theme={theme} mode={globals.mode ?? "light"} contrast={globals.contrast ?? "normal"}>
      {globals.host === "hostile" && <HostileHost />}
      <div
        style={{
          background: "var(--cy-color-bg)",
          color: "var(--cy-color-ink)",
          padding: 24,
          // Full height on a story page; natural height inside a docs page so examples stay compact.
          minHeight: viewMode === "docs" ? undefined : "100vh",
          boxSizing: "border-box",
        }}
      >
        <Story />
      </div>
    </CynosureTheme>
  );
};

const choice = (title: string, items: string[], icon?: string) => ({
  toolbar: { title, icon, items: items.map((value) => ({ value, title: value })), dynamicTitle: true },
});

const preview: Preview = {
  decorators: [withCynosure],
  parameters: { a11y: { test: "error" }, layout: "fullscreen" },
  globalTypes: {
    mode: choice("Mode", ["light", "dark", "system"], "mirror"),
    contrast: choice("Contrast", ["normal", "more"], "contrast"),
    scale: choice("Scale", ["compact", "comfortable", "spacious"], "grow"),
    accent: choice("Accent", Object.keys(ACCENTS), "paintbrush"),
    host: choice("Host CSS", ["clean", "hostile"], "alert"),
  },
  initialGlobals: {
    mode: "light",
    contrast: "normal",
    scale: "comfortable",
    accent: "Default",
    host: "clean",
  },
};
export default preview;
