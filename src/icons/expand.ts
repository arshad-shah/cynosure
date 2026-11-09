import type { IconData } from "./types.js";

export const expand: IconData = {
  name: "expand",
  body: [
    ["path", { d: "M12 3v6M9 6l3-3 3 3M12 21v-6M9 18l3 3 3-3", animate: true }],
    ["path", { d: "M4 12h16" }],
  ],
  motion: "pop",
};
