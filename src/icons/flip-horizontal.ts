import type { IconData } from "./types.js";

export const flipHorizontal: IconData = {
  name: "flip-horizontal",
  category: "editing",
  body: [
    ["path", { d: "M12 3v2m0 3.5v2m0 3.5v2m0 3.5v2" }],
    ["path", { d: "M9 6.5v11L3.5 12zm6 0v11l5.5-5.5z", animate: true }],
  ],
  motion: "flip",
};
