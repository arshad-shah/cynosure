import type { IconData } from "./types.js";

export const gauge: IconData = {
  name: "gauge",
  category: "status",
  body: [
    ["path", { d: "M6 19.5a8.5 8.5 0 1 1 12 0" }],
    ["path", { d: "M12 13.5l3.5-3.5", animate: true }],
  ],
  motion: "spin",
};
