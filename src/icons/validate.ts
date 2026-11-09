import type { IconData } from "./types.js";

const NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const TAGS = new Set(["path", "rect", "circle"]);
const ALLOWED: Record<string, Set<string>> = {
  path: new Set(["d", "animate"]),
  rect: new Set(["x", "y", "width", "height", "rx", "animate"]),
  circle: new Set(["cx", "cy", "r", "animate"]),
};
const inGrid = (n: number) => Number.isFinite(n) && n >= 0 && n <= 24;

/** Returns every rule an icon breaks; empty means it is a valid Facet icon. */
export function validateIcon(icon: IconData): string[] {
  const errors: string[] = [];
  if (!NAME.test(icon.name)) errors.push(`name "${icon.name}" must be kebab-case`);
  if (!icon.body.length) errors.push("body is empty");
  for (const [tag, attrs] of icon.body) {
    if (!TAGS.has(tag)) {
      errors.push(`<${tag}> is not allowed (no text or other elements; paths, rects and circles only)`);
      continue;
    }
    for (const key of Object.keys(attrs)) {
      if (key === "fill") errors.push(`${tag} has a fill: Facet icons are stroke only`);
      else if (!ALLOWED[tag]?.has(key)) errors.push(`${tag} has unsupported attribute "${key}"`);
    }
    const a = attrs as unknown as Record<string, unknown>;
    if (
      tag === "rect" &&
      ![a.x, a.y, (a.x as number) + (a.width as number), (a.y as number) + (a.height as number)].every((n) =>
        inGrid(n as number),
      )
    )
      errors.push("rect is outside the 24 grid");
    if (
      tag === "circle" &&
      ![
        (a.cx as number) - (a.r as number),
        (a.cy as number) - (a.r as number),
        (a.cx as number) + (a.r as number),
        (a.cy as number) + (a.r as number),
      ].every((n) => inGrid(n))
    )
      errors.push("circle is outside the 24 grid");
    if (tag === "path" && !/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/.test(String(a.d)))
      errors.push("path data has invalid characters");
  }
  return errors;
}
