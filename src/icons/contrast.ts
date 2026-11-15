import type { IconData } from "./types.js";

export const contrast: IconData = {
  name: "contrast",
  category: "design",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M12 3.5v17m0-13h4.5M12 12h6m-6 4.5h4.5", animate: true }],
  ],
  motion: "spin",
};
