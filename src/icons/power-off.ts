import type { IconData } from "./types.js";

export const powerOff: IconData = {
  name: "power-off",
  category: "actions",
  body: [
    ["path", { d: "M12 3.5v4.96m-6.74.34a7.5 7.5 0 0 0 10.03 10.03m3.51-3.57A7.5 7.5 0 0 0 17 6.5" }],
    ["path", { d: "M3.5 3.5l17 17", animate: true }],
  ],
  motion: "pop",
};
