import type { IconData } from "./types.js";

export const flashlight: IconData = {
  name: "flashlight",
  category: "devices",
  body: [
    ["path", { d: "M7 3.5h10V6l-2.5 4v9.5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V10L7 6zM7 6h10" }],
    ["path", { d: "M12 13v2", animate: true }],
  ],
  motion: "pop",
};
