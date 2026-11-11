/** The first paragraph of a Markdown document, as plain text: the page description. */
export function firstParagraph(body = ""): string {
  const para = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|```|\||!\[|<|>|- |\* |\d+\. )/.test(p));
  return (para ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 200);
}
