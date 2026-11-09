import type { IconData } from "./types.js";

export const info: IconData = {
  name: "info",
  category: "status",
  body: [
    ["rect", { x: 3.5, y: 3.5, width: 17, height: 17, rx: 5 }],
    ["path", { d: "M12 11v5.5M12 7.75h.01" }],
  ],
  motion: "pop",
};
