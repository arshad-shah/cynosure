import type { IconData } from "./types.js";

export const fieldText: IconData = {
  name: "field-text",
  category: "editing",
  body: [
    ["rect", { x: 3, y: 7, width: 18, height: 10, rx: 2.5 }],
    ["path", { d: "M9 10h6m-3 0v4.5", animate: true }],
  ],
  motion: "pop",
};
