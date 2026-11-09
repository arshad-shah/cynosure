import type { IconData } from "./types";

export const collapse: IconData = {
  name: "collapse",
  body: [
    ["path", { d: "M12 3v6M9 6l3 3 3-3M12 21v-6M9 18l3-3 3 3", animate: true }],
    ["path", { d: "M4 12h16" }],
  ],
  star: { x: 18.5, y: 3 },
  motion: "pop",
};
