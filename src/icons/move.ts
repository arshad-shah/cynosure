import type { IconData } from "./types.js";

export const move: IconData = {
  name: "move",
  category: "arrows",
  body: [
    ["path", { d: "M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3", animate: true }],
  ],
  motion: "pop",
};
