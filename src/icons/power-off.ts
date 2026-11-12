import type { IconData } from "./types.js";

export const powerOff: IconData = {
  name: "power-off",
  category: "actions",
  body: [
    ["path", { d: "M12 3.5V8M5.5 8.34A7.5 7.5 0 0 0 15.52 18.71M18.62 15.61A7.5 7.5 0 0 0 17 6.5" }],
    ["path", { d: "M3.5 3.5l17 17", animate: true }],
  ],
  motion: "pop",
};
