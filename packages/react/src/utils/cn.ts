export type ClassValue = string | number | boolean | null | undefined | ClassValue[];

/**
 * Concatenates class-name inputs, dropping falsy values and flattening nested
 * arrays. Deliberately tiny — no `clsx` dependency. We don't need
 * tailwind-merge because components author their own class names (vanilla
 * extract recipes), so there are no conflicting utilities to resolve.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const i of inputs) {
    if (!i) continue;
    if (typeof i === 'string' || typeof i === 'number') {
      out.push(String(i));
    } else if (Array.isArray(i)) {
      const s = cn(...i);
      if (s) out.push(s);
    }
  }
  return out.join(' ');
}
