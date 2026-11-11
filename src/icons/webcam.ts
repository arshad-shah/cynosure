import type { IconData } from "./types.js";

export const webcam: IconData = {
  name: "webcam",
  category: "devices",
  body: [
    ["circle", { cx: 12, cy: 10, r: 6.5 }],
    ["circle", { cx: 12, cy: 10, r: 2.5 }],
    ["path", { d: "M8 20.5h8M12 16.5v4" }],
  ],
};
