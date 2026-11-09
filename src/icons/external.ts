import type { IconData } from "./types";

export const external: IconData = {
  name: "external",
  body: [
    ["path", { d: "M14 4h6v6M20 4l-8 8", animate: true }],
    ["path", { d: "M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" }],
  ],
  star: { x: 3, y: 2.5 },
  motion: "nudge",
};
