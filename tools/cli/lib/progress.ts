import { readFileSync } from "node:fs";

export const PROGRESS_SECTIONS = [
  "Status",
  "Current task",
  "Next step",
  "Plans",
  "Blockers",
  "Decision log",
  "Verification",
  "How to resume",
] as const;

/** Parses docs/PROGRESS.md; throws naming the first missing section. */
export function readProgress(path: string): { current: string; next: string } {
  const text = readFileSync(path, "utf8");
  const sections = new Map<string, string>();
  for (const block of text.split(/^## /m).slice(1)) {
    const [title = "", ...body] = block.split("\n");
    sections.set(title.trim(), body.join("\n").trim());
  }
  for (const name of PROGRESS_SECTIONS)
    if (!sections.has(name)) throw new Error(`PROGRESS.md is missing the "## ${name}" section`);
  return { current: sections.get("Current task") ?? "", next: sections.get("Next step") ?? "" };
}
