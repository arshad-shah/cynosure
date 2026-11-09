import type { IconData } from "./types.js";

export const columns: IconData = {
  name: "columns",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M12 4.5v15", animate: true }],
  ],
  motion: "slide",
};
