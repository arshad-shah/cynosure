import type { IconData } from "./types.js";

export const mosque: IconData = {
  name: "mosque",
  category: "faith",
  body: [
    ["path", { d: "M2.5 20.5h19m-14 0V14h9v6.5M4 20.5v-12m16 12v-12" }],
    ["path", { d: "M7.5 14c0-3.5 4.5-4.5 4.5-8 0 3.5 4.5 4.5 4.5 8M12 6V3.5", animate: true }],
  ],
  motion: "lift",
};
