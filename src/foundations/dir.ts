/** Whether `el` lays out right to left (its computed `direction`, so it follows `dir` set on any ancestor). */
export const isRtl = (el: Element) => getComputedStyle(el).direction === "rtl";
