import type { IconData } from "./types.js";

export const signpost: IconData = {
  name: "signpost",
  category: "travel",
  body: [
    ["path", { d: "M12 3.5v17m-3 0h6" }],
    ["path", { d: "M12 5h6l2 2-2 2h-6m0 2H6l-2 2 2 2h6", animate: true }],
  ],
  motion: "tilt",
};
