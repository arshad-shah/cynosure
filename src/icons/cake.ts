import type { IconData } from "./types.js";

export const cake: IconData = {
  name: "cake",
  category: "home",
  body: [
    ["rect", { x: 4, y: 11, width: 16, height: 9.5, rx: 2 }],
    ["path", { d: "M4 15.5c2.7 1.3 5.3 1.3 8 0s5.3-1.3 8 0M12 11V8" }],
    ["path", { d: "M12 3.5c.9.9 1.2 1.6 1.2 2.2a1.2 1.2 0 0 1-2.4 0c0-.6.3-1.3 1.2-2.2", animate: true }],
  ],
  motion: "tilt",
};
