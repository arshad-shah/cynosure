# BitField

The bits of a number as a row of toggle buttons, highest first and grouped by byte, for a number converter or a flags register. It is an APG toolbar of square pressed [Button](../Button/README.md)s ([Toolbar](../Toolbar/README.md)): one tab stop, the arrows between the bits, Space or a press flips one. The value is a `bigint`, so 64-bit words work.

```tsx
import { BitField } from "@arshad-shah/cynosure";

<BitField label="Bits" bits={16} value={word} onChange={setWord} />
<BitField label="Flags" bits={8} groupSize={4} defaultValue={0x05n} />
```

| Prop                     | Default         | Notes                                                             |
| ------------------------ | --------------- | ----------------------------------------------------------------- |
| `label`                  | –               | Names the toolbar                                                 |
| `bits`                   | `8`             | How many bits, highest first                                      |
| `groupSize`              | `8`             | Bits per group (4 for hex digits); the lowest group ends at bit 0 |
| `value` / `defaultValue` | `0n`            | A `bigint`; only its low `bits` bits show                         |
| `onChange(value)`        | –               | The new `bigint` after a bit flips                                |
| `disabled`               | –               | Every bit                                                         |
| `size` / `tone`          | `md` / `accent` | The toggles' size, and the fill of a set bit                      |
| `labels`                 | –               | `bit(index)` ("Bit 7"), `group(high, low)` ("Bits 15 to 8")       |
| `className` / `style`    | –               | Layout only                                                       |
- Each bit is a Button with `aria-pressed`, named by its index and showing 1 or 0; each group is a named `group`. Arrows (Left/Right), Home and End move between the bits across groups; Tab leaves in one step.
- The bits stay highest-first, left to right, in right-to-left pages too, as numbers are written; the arrows follow what is shown.
- Touch: each bit's hit area is the Button's, 44px on coarse pointers.

## Tokens

- `--cy-bit-field-gap`: space between groups
- `--cy-bit-field-bit-gap`: space between the bits of a group
