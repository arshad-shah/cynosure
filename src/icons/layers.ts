import type { IconData } from "./types.js";

export const layers: IconData = {
  name: "layers",
  category: "data",
  body: [
    ["path", { d: "M12 4l8.5 4.5L12 13 3.5 8.5z", animate: true }],
    ["path", { d: "M3.5 12.5 12 17l8.5-4.5m-17 4L12 21l8.5-4.5" }],
  ],
  motion: "lift",
};
