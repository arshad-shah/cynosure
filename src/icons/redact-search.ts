import type { IconData } from "./types.js";

export const redactSearch: IconData = {
  name: "redact-search",
  category: "security",
  body: [
    ["rect", { x: 3.5, y: 3.5, width: 13, height: 13, rx: 4 }],
    ["path", { d: "m16.5 16.5 4 4" }],
    ["path", { d: "M7.25 9.25h5.5m-5.5 1.5h5.5", animate: true }],
  ],
  motion: "slide",
};
