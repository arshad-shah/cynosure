import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Cynosure",
    brandUrl: "https://github.com/arshad-shah/cynosure",
    brandImage: "./brand/cynosure-lockup.svg",
    brandTarget: "_blank",
    colorPrimary: "#c2410c",
    colorSecondary: "#c2410c",
    appBg: "#f4f1ea",
    appContentBg: "#fbf9f5",
    appBorderColor: "#dcd6cb",
    textColor: "#1d1b18",
    barBg: "#fbf9f5",
    fontBase: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontCode: 'ui-monospace, "SF Mono", Menlo, monospace',
  }),
});
