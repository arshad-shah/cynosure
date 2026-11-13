import { type RefObject, useCallback, useState } from "react";
import { useClientLayoutEffect } from "./client-layout-effect.js";

/**
 * The text of a typed field (a date, a time) while it is being edited, and the problem shown for it. While the draft is
 * not a value `check` accepts, the input carries `check`'s message as its custom validity, so a form will not submit
 * (the value it would submit is the last good one). `settle()` drops the draft and the problem: after a commit, a pick,
 * or a form reset. DateField and TimeField use it.
 */
export function useDraft(input: RefObject<HTMLInputElement | null>, check: (draft: string) => string | null) {
  const [draft, setDraft] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const invalid = draft === null ? null : check(draft);
  useClientLayoutEffect(() => {
    input.current?.setCustomValidity(invalid ?? "");
  }, [invalid]);
  const settle = useCallback(() => {
    setDraft(null);
    setProblem(null);
  }, []);
  return { draft, setDraft, problem, setProblem, settle };
}
