import type { IconData } from "./types.js";

export const powerOff: IconData = {
  name: "power-off",
  category: "actions",
  body: [
    ["path", { d: "M12 3.5V8m-6.5.34a7.5 7.5 0 0 0 10.02 10.37m3.1-3.1A7.5 7.5 0 0 0 17 6.5" }],
    ["path", { d: "M3.5 3.5l17 17", animate: true }],
  ],
  motion: "pop",
};
