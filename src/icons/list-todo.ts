import type { IconData } from "./types.js";

export const listTodo: IconData = {
  name: "list-todo",
  category: "editing",
  body: [
    ["path", { d: "m3.75 7.25 2 2 3.5-3.75", animate: true }],
    ["rect", { x: 4, y: 14.25, width: 5.25, height: 5.25, rx: 1.5 }],
    ["path", { d: "M12.5 7.25h8m-8 9.5h8" }],
  ],
  motion: "pop",
};
