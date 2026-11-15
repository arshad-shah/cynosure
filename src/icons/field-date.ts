import type { IconData } from "./types.js";

export const fieldDate: IconData = {
  name: "field-date",
  category: "editing",
  body: [
    ["rect", { x: 3, y: 7, width: 18, height: 10, rx: 2.5 }],
    ["path", { d: "M8 5v4m8-4v4", animate: true }],
    ["path", { d: "M8 13h.01M12 13h.01M16 13h.01" }],
  ],
  motion: "lift",
};
