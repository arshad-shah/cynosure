# Accordion

Stacked Disclosures with shared state.

```tsx
<Accordion type="single" defaultValue="format" collapsible>
  <AccordionItem value="format" summary="Formatting">
    …
  </AccordionItem>
  <AccordionItem value="export" summary="Export">
    …
  </AccordionItem>
</Accordion>;
```

| Prop                                       | Default  | Notes                                                       |
| ------------------------------------------ | -------- | ----------------------------------------------------------- |
| `type`                                     | `single` | `single` (one open) · `multiple`                            |
| `value` / `defaultValue` / `onValueChange` | –        | `string` for single, `string[]` for multiple                |
| `collapsible`                              | `false`  | Single: the open section can be closed                      |
| `variant`                                  | `line`   | `plain` · `line` · `card`                                   |
| `size`                                     | `md`     | `sm` · `md` · `lg`                                          |
| `headingLevel`                             | `3`      | Heading wrapping each header                                |
| `regions`                                  | `true`   | Open sections are labelled regions; turn off for long lists |


APG accordion: every header is a Tab stop; Up and Down move between headers (wrapping), Home and End jump. A non-collapsible open header is `aria-disabled`.

Tokens: `--cy-accordion-gap` (card spacing) plus the Disclosure tokens.

**Printing:** a printout has every section open. Closed content is always in the page, so the print stylesheet only expands it.
