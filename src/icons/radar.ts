import type { IconData } from "./types.js";

export const radar: IconData = {
  name: "radar",
  category: "data",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M12 12l5.5-5.5M12 7.5a4.5 4.5 0 1 0 4.5 4.5M15.5 15h.01" }],
  ],
};
