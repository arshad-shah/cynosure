import type { IconData } from "./types.js";

export const lamp: IconData = {
  name: "lamp",
  category: "home",
  body: [
    ["path", { d: "M8.5 3.5h7l3 8h-13zm3.5 8v9m-3.5 0h7" }],
    ["path", { d: "M16 11.5V15", animate: true }],
  ],
  motion: "drop",
};
