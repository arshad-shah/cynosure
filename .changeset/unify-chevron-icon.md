---
'@arshad-shah/cynosure-react': patch
---

Use one chevron across the library. Every dropdown/disclosure indicator now
renders lucide's `ChevronDown` (the icon `Combobox` already used) at a
consistent size — replacing the mix of the `ChevronDownIcon` alias, three
per-picker inline-SVG wrappers (DatePicker / DateRangePicker / TimePicker),
and the default-24px renders in Select/Combobox. Form-control triggers
(Select, Combobox, MultiSelect, DatePicker, DateRangePicker, TimePicker) all
use `<ChevronDown size={16} aria-hidden />`; Accordion uses the same icon,
sized for its header. Decorative inline-SVG icons in the Chip/Collapsible
stories were also swapped for lucide icons.
