---
"@arshad-shah/cynosure": minor
---

Printing: closed `Accordion` and `Disclosure` sections print open, and every `TabPanel` prints, in order (unselected panels render their content while the page is printed). The shared `usePrinting()` hook is in `src/foundations/printing.ts`.
