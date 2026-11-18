import type { IconData } from "./types.js";

export const listTodo: IconData = {
  name: "list-todo",
  category: "editing",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 5.5, height: 5.5, rx: 1.5 }],
    ["path", { d: "m4.9 7.3 1.3 1.3L8.5 6", animate: true }],
    ["rect", { x: 3.5, y: 14, width: 5.5, height: 5.5, rx: 1.5 }],
    ["path", { d: "M12.5 7.25h8m-8 9.5h8" }],
  ],
  motion: "pop",
};
