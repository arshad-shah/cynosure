/**
 * Live examples come from the component's own stories: the ones its docs page (`<Name>.mdx`) shows in a
 * `<Canvas of={Stories.X} />`. Here each gets the name shown above it; the story itself is loaded and rendered in
 * the browser, which also writes its code from what it renders (`engine/app/Canvas.tsx`, `engine/app/jsx.ts`).
 */
import type { Example } from "../types.ts";

/** `VariantsAndTones` is "Variants and tones". */
const label = (name: string) => {
  const words = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * True when a story opens something over the page as soon as it renders (`<Dialog defaultOpen>`, `open` passed as
 * true): on a docs page that would cover the text, so the canvas waits for the reader to open it.
 */
function opensOnLoad(source: string, story: string): boolean {
  const opens = /\bdefaultOpen\b(?!=\{false\}|:\s*false)|\bopen(?=[\s/>])|\bopen=\{true\}|\bopen:\s*true/;
  const block = (pattern: RegExp) => {
    const start = source.search(pattern);
    if (start === -1) return "";
    const rest = source.slice(start + 1);
    const end = rest.search(/\nexport (const|default) /);
    return (end === -1 ? rest : rest.slice(0, end)).split(/\bplay\s*:/)[0] ?? "";
  };
  const own = block(new RegExp(`export const ${story}\\b`));
  // Args every story shares (`meta`) count too, unless the story says otherwise.
  const shared = block(/\nconst meta\b/);
  if (/\b(defaultOpen|open):\s*false/.test(own)) return false;
  return opens.test(own) || /\b(defaultOpen|open):\s*true/.test(shared);
}

/** The examples named `stories`; `source` is the text of the stories file they live in. */
export const examplesOf = (stories: string[], source: string): Example[] =>
  [...new Set(stories)].map((story) => ({
    story,
    label: label(story),
    ...(opensOnLoad(source, story) ? { gated: true } : {}),
  }));
